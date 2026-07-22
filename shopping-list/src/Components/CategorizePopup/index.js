import React, { useState } from 'react'
import CategorySelect from '../CategorySelect'
import './style.css'

function CategorizePopup({
    items,
    categories,
    onCategoryCreated,
    onAssignCategory,
    onClose,
}) {
    const [index, setIndex] = useState(0)
    const [selectedCategoryId, setSelectedCategoryId] = useState(null)
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    if (!items.length) {
        return null
    }

    const currentItem = items[Math.min(index, items.length - 1)]
    const remaining = items.length - index

    const handleSave = async () => {
        if (!selectedCategoryId) {
            setError('Please select or create a category')
            return
        }
        setIsSaving(true)
        setError('')
        try {
            await onAssignCategory(currentItem, selectedCategoryId)
            const nextIndex = index + 1
            if (nextIndex >= items.length) {
                onClose()
            } else {
                setIndex(nextIndex)
                setSelectedCategoryId(null)
            }
        } catch (err) {
            console.log(err)
            setError('Failed to save category')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="categorize-popup">
            <div className="categorize-popup-inner">
                <button
                    type="button"
                    className="popup-close-btn"
                    onClick={onClose}
                >
                    X
                </button>

                <div className="categorize-popup-content">
                    <h2 className="categorize-title">Categorize items</h2>
                    <p className="categorize-progress">
                        {remaining} item{remaining === 1 ? '' : 's'} left
                    </p>
                    <p className="categorize-item-name">{currentItem.itemName}</p>

                    <CategorySelect
                        value={selectedCategoryId}
                        onChange={(categoryId) => {
                            setSelectedCategoryId(categoryId)
                            setError('')
                        }}
                        categories={categories}
                        onCategoryCreated={onCategoryCreated}
                        error={error}
                    />

                    <div className="categorize-actions">
                        <button
                            type="button"
                            className="categorize-skip-btn"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Skip for now
                        </button>
                        <button
                            type="button"
                            className="categorize-save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save & next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategorizePopup
