import { useEffect, useMemo, useState } from 'react';
import { Building2, Gift, Percent, Plus, Save, Trash2, Search, Edit3, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../api/client';

const segmentLabels = ['Hot', 'Warm', 'Cold'];

const emptyForm = {
  HotelName: '',
  HotelCode: '',
  MaxDiscountPercent: 0,
  DefaultOffer: '',
  OfferRules: segmentLabels.map((leadSegment) => ({
    leadSegment,
    initialOffer: '',
    followUpOffer: '',
    autoFollowUpOffer: '',
  })),
};

const HotelListSkeleton = () => (
  <div className="p-2 space-y-2">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="p-4 rounded-xl animate-pulse">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-dark-700"></div>
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-dark-700"></div>
          </div>
          <div className="h-5 w-5 rounded bg-slate-200 dark:bg-dark-700"></div>
        </div>
      </div>
    ))}
  </div>
);

const HotelOfferConfiguration = () => {
  const [hotelOffers, setHotelOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const loadHotelOffers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hotel-offers');
      const data = response.data || [];
      setHotelOffers(data);
      
      // If we have hotels and none selected, select the first one
      if (data.length > 0 && !editingHotel) {
        selectHotel(data[0]);
      }
    } catch (error) {
      console.error('Failed to load hotel offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotelOffers();
  }, []);

  const selectHotel = (hotel) => {
    setEditingHotel(hotel);
    if (hotel) {
      setFormData({
        HotelName: hotel.HotelName || '',
        HotelCode: hotel.HotelCode || '',
        MaxDiscountPercent: hotel.MaxDiscountPercent || 0,
        DefaultOffer: hotel.DefaultOffer || '',
        OfferRules: segmentLabels.map((leadSegment) => {
          const rule = hotel.OfferRules?.find((item) => item.leadSegment === leadSegment) || {};
          return {
            leadSegment,
            initialOffer: rule.initialOffer || '',
            followUpOffer: rule.followUpOffer || '',
            autoFollowUpOffer: rule.autoFollowUpOffer || '',
          };
        }),
      });
    } else {
      setFormData(emptyForm);
    }
  };

  const handleAddNew = () => {
    setEditingHotel(null);
    setFormData(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const editingId = editingHotel?.HotelOfferID;
      const endpoint = editingId ? `/hotel-offers/${editingId}` : '/hotel-offers';
      const method = editingId ? api.put : api.post;
      
      const response = await method(endpoint, formData);
      await loadHotelOffers();
      
      // If it was a new hotel, select it in the list (if we can find it)
      if (!editingId && response.data) {
        setEditingHotel(response.data);
      }
      
      setMessage('Configuration saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save hotel offer:', error);
      setMessage('Unable to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const deleteHotelOffer = async (e, hotelOfferId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this hotel configuration?')) return;
    
    try {
      await api.delete(`/hotel-offers/${hotelOfferId}`);
      if (editingHotel?.HotelOfferID === hotelOfferId) {
        handleAddNew();
      }
      await loadHotelOffers();
    } catch (error) {
      console.error('Failed to delete hotel offer:', error);
    }
  };

  const updateRule = (leadSegment, field, value) => {
    setFormData((prev) => ({
      ...prev,
      OfferRules: prev.OfferRules.map((rule) => (
        rule.leadSegment === leadSegment ? { ...rule, [field]: value } : rule
      )),
    }));
  };

  const filteredHotels = hotelOffers.filter(hotel => 
    hotel.HotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hotel.HotelCode && hotel.HotelCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Property Configurations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage property-specific offers and discount constraints.</p>
        </div>
        {message && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-2 text-sm font-bold flex items-center gap-2">
            <Save size={16} /> {message}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Left Side: Property List */}
        <div className="w-full md:w-[350px] flex flex-col bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-dark-800 space-y-4">
            <button 
              onClick={handleAddNew}
              className="w-full py-2.5 px-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all border border-primary-100 dark:border-primary-500/20"
            >
              <Plus size={18} /> Add New Property
            </button>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search properties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border-none text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading ? (
              <HotelListSkeleton />
            ) : filteredHotels.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">No properties found</p>
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <button
                  key={hotel.HotelOfferID}
                  onClick={() => selectHotel(hotel)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group flex items-center justify-between ${
                    editingHotel?.HotelOfferID === hotel.HotelOfferID
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 active:scale-[0.98]'
                      : 'hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`font-bold truncate ${editingHotel?.HotelOfferID === hotel.HotelOfferID ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {hotel.HotelName}
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${editingHotel?.HotelOfferID === hotel.HotelOfferID ? 'text-primary-100' : 'text-slate-400'}`}>
                      {hotel.HotelCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 
                      size={16} 
                      onClick={(e) => deleteHotelOffer(e, hotel.HotelOfferID)}
                      className={`shrink-0 transition-opacity ${editingHotel?.HotelOfferID === hotel.HotelOfferID ? 'text-white/60 hover:text-white' : 'text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`} 
                    />
                    <ChevronRight size={18} className={editingHotel?.HotelOfferID === hotel.HotelOfferID ? 'text-white/40' : 'text-slate-300'} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Configuration Form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Gift size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingHotel ? 'Edit Property Offers' : 'New Property Setup'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Define automated rewards and offer triggers.</p>
              </div>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving || !formData.HotelName || !formData.HotelCode}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Name</label>
                <input 
                  required 
                  value={formData.HotelName} 
                  onChange={(e) => setFormData((prev) => ({ ...prev, HotelName: e.target.value }))} 
                  placeholder="E.g. Grand Plaza Resort" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-dark-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-800 transition-all outline-none font-bold text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Code</label>
                <input 
                  required
                  value={formData.HotelCode} 
                  onChange={(e) => setFormData((prev) => ({ ...prev, HotelCode: e.target.value }))} 
                  placeholder="GPR-2024" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-dark-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-800 transition-all outline-none uppercase font-bold text-slate-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Discount Limit</label>
                <div className="relative">
                  <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    value={formData.MaxDiscountPercent} 
                    onChange={(e) => setFormData((prev) => ({ ...prev, MaxDiscountPercent: e.target.value }))} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-800 transition-all outline-none font-bold text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Default Offer</label>
              <textarea 
                value={formData.DefaultOffer} 
                onChange={(e) => setFormData((prev) => ({ ...prev, DefaultOffer: e.target.value }))} 
                rows="2" 
                placeholder="Describe the standard offer applied to all leads if no segment rules match..." 
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-dark-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-800 transition-all outline-none text-slate-700 dark:text-slate-300 resize-none italic" 
              />
            </div>

            {/* Segment Rules */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800 pb-2">
                <Gift size={16} className="text-primary-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Segment Intelligence Rules</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {formData.OfferRules.map((rule) => (
                  <div key={rule.leadSegment} className="rounded-2xl border border-slate-100 dark:border-dark-800 p-5 bg-white dark:bg-dark-800/50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        rule.leadSegment === 'Hot' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                        rule.leadSegment === 'Warm' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-slate-50 text-slate-600 dark:bg-dark-700 dark:text-slate-400'
                      }`}>
                        {rule.leadSegment} Segment
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Initial Outreach Offer</label>
                        <input 
                          value={rule.initialOffer} 
                          onChange={(e) => updateRule(rule.leadSegment, 'initialOffer', e.target.value)} 
                          placeholder="E.g. Free Breakfast" 
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-dark-700 border-none text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Follow-up Incentive</label>
                        <input 
                          value={rule.followUpOffer} 
                          onChange={(e) => updateRule(rule.leadSegment, 'followUpOffer', e.target.value)} 
                          placeholder="E.g. 10% Off Venue" 
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-dark-700 border-none text-sm focus:ring-2 focus:ring-primary-500 outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {!editingHotel && (
              <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 flex gap-4">
                <AlertCircle size={20} className="text-primary-600 shrink-0 mt-0.5" />
                <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed font-medium">
                  <strong>New Property Setup:</strong> You are creating a fresh configuration. All offers defined here will be available to the AI when drafting emails for leads assigned to this Property Code.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      ` }} />
    </div>
  );
};

export default HotelOfferConfiguration;
