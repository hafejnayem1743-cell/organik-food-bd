import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Calendar, 
  Link as LinkIcon, 
  X, 
  Check, 
  Clock, 
  Tag 
} from 'lucide-react';
import { Banner } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';

interface BannerManagerProps {
  banners: Banner[];
  onRefreshBanners: () => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({ banners, onRefreshBanners }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('🌿 100% Organic');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('#products');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setBadge('🌿 100% Organic');
    setButtonText('Shop Now');
    setButtonLink('#products');
    setDisplayOrder(banners.length + 1);
    setEnabled(true);
    setStartDate('');
    setEndDate('');
    setImagePreview('');
    setEditingBanner(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setBadge(banner.badge || '');
    setButtonText(banner.buttonText || '');
    setButtonLink(banner.buttonLink || '');
    setDisplayOrder(banner.displayOrder ?? 1);
    setEnabled(banner.enabled ?? true);
    setStartDate(banner.startDate ? banner.startDate.slice(0, 16) : '');
    setEndDate(banner.endDate ? banner.endDate.slice(0, 16) : '');
    setImagePreview(banner.image || '');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a banner title');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = imagePreview;

      // Upload to Cloudinary if base64 data URI
      if (imagePreview.startsWith('data:image')) {
        try {
          const uploadedUrl = await uploadToCloudinary(imagePreview);
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          }
        } catch (cErr) {
          console.warn("Cloudinary banner upload issue, keeping base64/fallback:", cErr);
        }
      }

      const now = new Date().toISOString();
      const bannerId = editingBanner?.id || (`banner-${Date.now()}`);

      const bannerData: Partial<Banner> = {
        id: bannerId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        displayOrder: Number(displayOrder) || 1,
        enabled,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        image: finalImageUrl,
        updatedAt: now,
        createdAt: editingBanner?.createdAt || now
      };

      // Direct write to Firestore 'banners' collection
      await setDoc(doc(db, 'banners', bannerId), bannerData, { merge: true });

      onRefreshBanners();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save banner error:", err);
      alert(`Error saving banner: ${err.message || 'Check Firestore connection'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnable = async (banner: Banner) => {
    try {
      const updatedStatus = !banner.enabled;
      await updateDoc(doc(db, 'banners', banner.id), { enabled: updatedStatus });
      onRefreshBanners();
    } catch (err: any) {
      console.error("Toggle banner status error:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this promo banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      onRefreshBanners();
    } catch (err: any) {
      console.error("Delete banner error:", err);
      alert(`Failed to delete banner: ${err.message}`);
    }
  };

  const handleMoveOrder = async (banner: Banner, direction: 'up' | 'down') => {
    const sorted = [...banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const currentIndex = sorted.findIndex(b => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const otherBanner = sorted[targetIndex];
    const currentOrder = banner.displayOrder ?? (currentIndex + 1);
    const otherOrder = otherBanner.displayOrder ?? (targetIndex + 1);

    try {
      await updateDoc(doc(db, 'banners', banner.id), { displayOrder: otherOrder });
      await updateDoc(doc(db, 'banners', otherBanner.id), { displayOrder: currentOrder });
      onRefreshBanners();
    } catch (err: any) {
      console.error("Move banner order error:", err);
    }
  };

  // Sorted list for rendering
  const sortedBanners = [...banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-emerald-500/30">
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Homepage Banner Manager</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Create, edit, reorder, and schedule auto-sliding promo hero banners for the homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer border border-emerald-400/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banner List */}
      {sortedBanners.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🖼️
          </div>
          <h4 className="text-base font-bold text-slate-800">No Custom Banners Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The homepage is currently displaying the default organic promo banner. Click "Add New Banner" to publish your custom promo slide!
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedBanners.map((b, index) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                b.enabled
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* Image & Main Info */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-24 h-16 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-200 shrink-0">
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      No Image
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    #{b.displayOrder}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {b.badge && (
                      <span className="text-[10px] font-black bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                        {b.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      b.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{b.title}</h4>
                  {b.subtitle && <p className="text-xs text-slate-500 line-clamp-1">{b.subtitle}</p>}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    {b.buttonText && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Button: {b.buttonText} ({b.buttonLink || '#'})
                      </span>
                    )}
                    {b.startDate && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span>Start: {new Date(b.startDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    {b.endDate && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-rose-500" />
                        <span>End: {new Date(b.endDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls & Actions */}
              <div className="flex items-center space-x-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                
                {/* Order Up / Down */}
                <button
                  type="button"
                  onClick={() => handleMoveOrder(b, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveOrder(b, 'down')}
                  disabled={index === sortedBanners.length - 1}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleEnable(b)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                    b.enabled 
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' 
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                  title={b.enabled ? 'Disable Banner' : 'Enable Banner'}
                >
                  {b.enabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(b)}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer transition-colors"
                  title="Edit Banner"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteBanner(b.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-black flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span>{editingBanner ? 'Edit Promo Banner' : 'Add New Promo Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBanner} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Banner Background Image
                </label>
                
                <div className="relative w-full h-36 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                      <p className="text-xs font-semibold">Upload high-res banner image</p>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold space-x-1">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or Direct Image URL */}
                <input
                  type="text"
                  placeholder="Or paste Image URL (https://...)"
                  value={imagePreview}
                  onChange={(e) => setImagePreview(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Main Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Organic Harvest - 20% OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Healthy & Pure Organic Food Delivered Directly to Your Home"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Badge & Button Text Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-yellow-600" />
                    <span>Small Badge Tag</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🌿 100% Organic"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Button Link & Display Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Button Link</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #products or https://..."
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Display Order Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Scheduling Start & End Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Start Date (Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>End Date (Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Status Toggle Checkbox */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabledBannerCheck"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="enabledBannerCheck" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  Enable Banner Immediately
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingBanner ? 'Update Banner' : 'Publish Banner'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
