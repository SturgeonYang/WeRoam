// src/components/TripPlanningForm.tsx

import React, { useState, useEffect } from 'react';
import { MapPin, Users, Calendar, Mountain, Car } from 'lucide-react'; 

export const TRAVEL_MODES = ['自驾/租车', '打车/网约车', '地铁/公交', 'CityWalk/步行']; 
export const TRAVEL_STYLES = ['休闲放松', '文化探索', '自然风光', '美食探索', '亲子游', '户外运动'];
export const BUDGET_TYPES = ['经济型', '中等', '奢华'];
export const TRAVEL_PACES = ['特种兵 (快)', '适中 (平衡)', '慢节奏 (休闲)'];

// 导出 TripFormData 接口，供 AIChat.tsx 使用
export interface TripFormData {
    destination: string;
    travellers: number;
    days: number;
    travelMode: string[]; // 修改为字符串数组，支持多选
    style: string[]; 
    budget: string; 
    pace: string;
}

interface TripPlanningFormProps {
    onSubmit: (data: TripFormData) => void;
    onClose: () => void;
    initialData?: Partial<TripFormData>; // 接受预填充数据
}

export default function TripPlanningForm({ onSubmit, onClose, initialData }: TripPlanningFormProps) {
    const [form, setForm] = useState<TripFormData>(() => ({
        // 使用 initialData 自动填充，否则使用默认值
        destination: initialData?.destination || '上海',
        travellers: initialData?.travellers || 2,
        days: initialData?.days || 3,
        // 确保 travelMode 是数组
        travelMode: Array.isArray(initialData?.travelMode) 
            ? initialData.travelMode 
            : (initialData?.travelMode ? [initialData.travelMode] : [TRAVEL_MODES[0]]),
        style: initialData?.style || ['文化探索'],
        budget: initialData?.budget || BUDGET_TYPES[1],
        pace: initialData?.pace || TRAVEL_PACES[1],
    }));

    // 同步外部传入的 initialData
    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
                ...prev,
                ...initialData,
                // 确保 destination 是最新识别到的
                destination: initialData.destination || prev.destination,
                // 确保 travelMode 是数组
                travelMode: Array.isArray(initialData.travelMode) 
                    ? initialData.travelMode 
                    : (initialData.travelMode ? [initialData.travelMode] : prev.travelMode)
            }));
        }
    }, [initialData]);

    // 切换风格：最多选择 3 个
    const toggleStyle = (tag: string) => {
        setForm(prev => {
            const newStyles = prev.style.includes(tag) 
                ? prev.style.filter(s => s !== tag) 
                : [...prev.style, tag].slice(0, 3);
            return { ...prev, style: newStyles };
        });
    };

    // 切换交通方式：多选
    const toggleTravelMode = (tag: string) => {
        setForm(prev => {
            const newModes = prev.travelMode.includes(tag)
                ? prev.travelMode.filter(m => m !== tag)
                : [...prev.travelMode, tag];
            // 至少保留一个
            return { ...prev, travelMode: newModes.length > 0 ? newModes : [tag] };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form); 
    };

    // 辅助组件：渲染选项按钮
    const OptionButtons = ({ options, current, onChange }: { options: string[], current: string | string[], onChange: (tag: string) => void }) => (
        <div className="flex flex-wrap gap-2">
            {options.map(tag => (
                <button key={tag} type="button" onClick={() => onChange(tag)} 
                className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    (Array.isArray(current) ? current.includes(tag) : current === tag) 
                    ? 'bg-yellow-500 text-white shadow-md border-yellow-500' : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 border-gray-200'}`}>
                    {tag}
                </button>
            ))}
        </div>
    );


    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 目的地 */}
            <div>
                <label className="text-base font-semibold text-gray-700 flex items-center mb-2">
                    <MapPin className="w-5 h-5 mr-2 text-yellow-600" /> 目的地 (必填)
                </label>
                <input 
                    type="text" 
                    value={form.destination} 
                    onChange={(e) => setForm({...form, destination: e.target.value})} 
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" 
                    placeholder="请输入城市名称"
                    required 
                />
            </div>

            {/* 人数 & 天数 */}
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="text-base font-semibold text-gray-700 flex items-center mb-2"><Users className="w-5 h-5 mr-2 text-yellow-600"/>人数</label>
                    <input 
                        type="number" 
                        value={form.travellers || ''} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setForm({...form, travellers: isNaN(val) ? 0 : val});
                        }} 
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" 
                        min="1" 
                    />
                </div>
                <div className="flex-1">
                    <label className="text-base font-semibold text-gray-700 flex items-center mb-2"><Calendar className="w-5 h-5 mr-2 text-yellow-600"/>天数</label>
                    <input 
                        type="number" 
                        value={form.days || ''} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setForm({...form, days: isNaN(val) ? 0 : val});
                        }} 
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" 
                        min="1" 
                        max="14" 
                    />
                </div>
            </div>

            {/* 交通方式 */}
            <div>
                <label className="text-base font-semibold text-gray-700 flex items-center mb-2"><Car className="w-5 h-5 mr-2 text-yellow-600"/> 目的地交通偏好 (可多选)</label>
                <OptionButtons 
                    options={TRAVEL_MODES} 
                    current={form.travelMode} 
                    onChange={toggleTravelMode} 
                />
            </div>

            {/* 风格 */}
            <div>
                <label className="text-base font-semibold text-gray-700 flex items-center mb-2"><Mountain className="w-5 h-5 mr-2 text-yellow-600"/> 风格 (最多3个)</label>
                <OptionButtons 
                    options={TRAVEL_STYLES} 
                    current={form.style} 
                    onChange={toggleStyle} 
                />
            </div>

            {/* 预算 & 节奏 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-base font-semibold text-gray-700 flex items-center mb-2">预算</label>
                    <OptionButtons 
                        options={BUDGET_TYPES} 
                        current={form.budget} 
                        onChange={(tag) => setForm({...form, budget: tag})} 
                    />
                </div>
                <div>
                    <label className="text-base font-semibold text-gray-700 flex items-center mb-2">节奏</label>
                    <OptionButtons 
                        options={TRAVEL_PACES} 
                        current={form.pace} 
                        onChange={(tag) => setForm({...form, pace: tag})} 
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold mt-4 hover:bg-yellow-600 transition-colors shadow-lg">
                生成路线
            </button>
        </form>
    )
}