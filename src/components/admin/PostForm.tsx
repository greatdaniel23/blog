import React, { useState } from 'react';
import GalleryModal from './GalleryModal';

interface PostFormProps {
    initialData?: {
        title: string;
        slug: string;
        description: string;
        content: string;
        hero_image: string;
        is_published: boolean;
    };
    isEditing?: boolean;
    onSubmit?: (data: any) => Promise<void>;
    apiEndpoint?: string;
    method?: string;
}

export default function PostForm({ initialData, isEditing = false, onSubmit, apiEndpoint, method = 'POST' }: PostFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        content: initialData?.content || '',
        hero_image: initialData?.hero_image || '',
        is_published: initialData?.is_published || false
    });
    const [submitting, setSubmitting] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, is_published: e.target.checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit(formData);
            } else if (apiEndpoint) {
                const res = await fetch(apiEndpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    window.location.href = '/pembantu/posts';
                } else {
                    alert('Failed to save post');
                }
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
        setSubmitting(false);
    };

    const handleImageSelect = (url: string) => {
        setFormData(prev => ({ ...prev, hero_image: url }));
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="wp-form-container">
                <div className="wp-form-group">
                    <label htmlFor="title" className="wp-form-label">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="wp-form-input"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="wp-form-group">
                    <label htmlFor="slug" className="wp-form-label">Slug</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        className="wp-form-input"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="wp-form-group">
                    <label htmlFor="description" className="wp-form-label">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className="wp-form-textarea"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="wp-form-group">
                    <label htmlFor="hero_image" className="wp-form-label">Featured Image</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="url"
                            id="hero_image"
                            name="hero_image"
                            className="wp-form-input"
                            value={formData.hero_image}
                            onChange={handleChange}
                            placeholder="https://..."
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            className="wp-button-secondary"
                            onClick={() => setShowGallery(true)}
                        >
                            Select Image
                        </button>
                    </div>
                    {formData.hero_image && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={formData.hero_image} alt="Preview" style={{ maxHeight: '150px', border: '1px solid #ddd' }} />
                        </div>
                    )}
                </div>

                <div className="wp-form-group">
                    <label htmlFor="content" className="wp-form-label">Content (Markdown)</label>
                    <textarea
                        id="content"
                        name="content"
                        className="wp-form-textarea"
                        rows={15}
                        value={formData.content}
                        onChange={handleChange}
                        required
                        style={{ fontFamily: 'var(--font-system)' }}
                    />
                </div>

                <div className="wp-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label className="wp-switch">
                        <input
                            type="checkbox"
                            checked={formData.is_published}
                            onChange={handleSwitchChange}
                        />
                        <span className="wp-slider round"></span>
                    </label>
                    <span className="wp-form-label" style={{ marginBottom: 0 }}>
                        {formData.is_published ? 'Published' : 'Draft'}
                    </span>
                </div>

                <div className="wp-form-actions">
                    <button type="submit" className="wp-button" disabled={submitting}>
                        {submitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/pembantu/posts'}
                        className="wp-button-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <GalleryModal
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                onSelect={handleImageSelect}
            />
        </>
    );
}
