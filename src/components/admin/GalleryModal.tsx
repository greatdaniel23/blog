import React, { useState, useEffect } from 'react';

interface Image {
    id: number;
    image_url: string;
    caption: string;
}

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

export default function GalleryModal({ isOpen, onClose, onSelect }: GalleryModalProps) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            // Re-using the admin gallery page API is tricky because it returns HTML.
            // Best to have a dedicated JSON API for fetching images.
            // For now, let's create a simple API endpoint for this: /api/pembantu/gallery/list
            const res = await fetch('/api/pembantu/gallery/list');
            if (res.ok) {
                const data = await res.json();
                setImages(data.images);
            }
        } catch (error) {
            console.error('Failed to fetch images', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', width: '80%', height: '80%',
                display: 'flex', flexDirection: 'column', borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
                <div style={{
                    padding: '16px', borderBottom: '1px solid #ddd',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Select Featured Image</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
                    }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px'
                        }}>
                            {images.map(img => (
                                <div key={img.id}
                                    onClick={() => { onSelect(img.image_url); onClose(); }}
                                    style={{ cursor: 'pointer', border: '1px solid #ddd', padding: '4px' }}
                                >
                                    <img src={img.image_url} alt={img.caption}
                                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
