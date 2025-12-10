// src/components/MapComponent.tsx
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 强力修复：使用 CDN 图标，解决图标加载失败问题
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// 默认图标（备用）
const defaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 创建可爱的自定义图标
const createCuteIcon = (index: number, type?: string) => {
    let bgColor = 'bg-blue-500';
    let borderColor = 'border-blue-200';
    
    if (type === 'food') {
        bgColor = 'bg-orange-500';
        borderColor = 'border-orange-200';
    } else if (type === 'spot') {
        bgColor = 'bg-green-500';
        borderColor = 'border-green-200';
    } else if (type === 'hotel') {
        bgColor = 'bg-indigo-500';
        borderColor = 'border-indigo-200';
    }

    // 使用 Tailwind 类名构建 HTML
    // 注意：Leaflet DivIcon 的 html 属性是一个字符串
    const html = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} border-4 ${borderColor} shadow-lg transform hover:scale-110 transition-transform duration-200">
            <span class="text-white font-bold text-sm">${index + 1}</span>
        </div>
    `;

    return L.divIcon({
        className: 'bg-transparent', // 移除默认背景
        html: html,
        iconSize: [32, 32],
        iconAnchor: [16, 16], // 中心对齐
        popupAnchor: [0, -20]
    });
};

interface Point {
  lat: number;
  lng: number;
  label?: string;
  type?: 'spot' | 'food' | 'hotel' | string;
}

interface MapComponentProps {
  points: Point[];
  heightClass: string;
  focusedPoint?: Point | null;
}

// 自动缩放和中心定位组件
const MapBoundsAdjuster: React.FC<{ points: Point[]; focusedPoint?: Point | null }> = ({ points, focusedPoint }) => {
  const map = useMap();
  
  // Handle bounds adjustment
  useEffect(() => {
    if (points.length > 0 && !focusedPoint) {
      const latLngs: LatLngTuple[] = points.map(p => [p.lat, p.lng]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [points, map, focusedPoint]);

  // Handle focus point
  useEffect(() => {
    console.log('MapBoundsAdjuster: focusedPoint changed', focusedPoint);
    if (focusedPoint && 
        typeof focusedPoint.lat === 'number' && !isNaN(focusedPoint.lat) && 
        typeof focusedPoint.lng === 'number' && !isNaN(focusedPoint.lng)) {
      console.log('Flying to:', focusedPoint);
      map.flyTo([focusedPoint.lat, focusedPoint.lng], 16, {
        duration: 1.5
      });
    } else {
        console.log('Not flying. focusedPoint invalid or null');
    }
  }, [focusedPoint, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ points, heightClass, focusedPoint }) => {
  const defaultCenter: LatLngTuple = [31.2304, 121.4737]; // 默认上海
  const polylinePositions: LatLngTuple[] = points.map(p => [p.lat, p.lng]);

  // key 确保在 points 改变时 MapContainer 重新渲染，避免 bug
  // 注意：如果 focusedPoint 改变，我们不希望重新挂载 MapContainer，所以 key 不应包含 focusedPoint
  const mapKey = points.length > 0 ? `${points[0].lat}-${points[0].lng}` : 'default';

  return (
    <div className={`w-full ${heightClass} rounded-lg overflow-hidden relative z-0`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={10} 
        className="w-full h-full"
        key={mapKey}
      >
        {/* 使用 CartoDB Voyager 风格地图，更加简约可爱 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* 绘制路线 (黄色) */}
        {points.length > 1 && (
            <Polyline positions={polylinePositions} pathOptions={{ color: '#FBBF24', weight: 4, opacity: 0.8, dashArray: '10, 10' }} />
        )}

        {/* 绘制点 */}
        {points.map((p, i) => (
          <Marker 
            key={i} 
            position={[p.lat, p.lng]} 
            icon={createCuteIcon(i, p.type)}
          >
            <Tooltip 
                permanent 
                direction="bottom" 
                offset={[0, 10]}
                className="custom-map-tooltip" // 我们需要在全局 CSS 中定义这个样式以去除默认边框
            >
                <div className="font-bold text-gray-700 text-xs px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-100">
                    {p.label}
                </div>
            </Tooltip>
          </Marker>
        ))}
        <MapBoundsAdjuster points={points} focusedPoint={focusedPoint} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;