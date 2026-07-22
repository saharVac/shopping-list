import React, { useEffect, useRef, useState } from 'react'
import { createCategory } from '../../DataHandling'
import './style.css'

function CategorySelect({
    value,
    onChange,
    categories,
    onCategoryCreated,
    required = true,
    allowCreate = true,
    label = 'Category',
    error = '',
    placeholder = 'Select or search category...',
    disabled = false,
    excludeIds = [],
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const wrapperRef = useRef(null)

    const excluded = new Set(excludeIds.map(String))
    const availableCategories = categories.filter(
        (category) => !excluded.has(String(category._id))
    )

    const selectedCategory =
        categories.find((category) => String(category._id) === String(value)) || null

    const filteredCategories = availableCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )

    const trimmedQuery = searchQuery.trim()
    const exactMatch = availableCategories.some(
        (category) => category.name.toLowerCase() === trimmedQuery.toLowerCase()
    )
    const showCreateOption = allowCreate && trimmedQuery.length >= 1 && !exactMatch

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectCategory = (category) => {
        onChange(category._id)
        setIsOpen(false)
        setSearchQuery('')
        setCreateError('')
    }

    const handleCreateCategory = async () => {
        if (!trimmedQuery || isCreating || !allowCreate) return
        setIsCreating(true)
        setCreateError('')
        try {
            const response = await createCategory(trimmedQuery)
            const newCategory = response.data
            if (onCategoryCreated) {
                onCategoryCreated(newCategory)
            }
            onChange(newCategory._id)
            setIsOpen(false)
            setSearchQuery('')
        } catch (err) {
            console.log(err)
            setCreateError(err.response?.data?.error || 'Failed to create category')
        } finally {
            setIsCreating(false)
        }
    }

    const listboxId = 'category-select-listbox'

    const displayValue = isOpen ? searchQuery : (selectedCategory ? selectedCategory.name : '')

    return (
        <div className={`category-select${disabled ? ' disabled' : ''}`} ref={wrapperRef}>
            {label !== null && label !== undefined && label !== '' && (
                <label className="category-select-label">
                    {label}{required ? ' *' : ''}
                </label>
            )}
            <div className="category-select-wrapper">
                <input
                    type="text"
                    role="combobox"
                    className="category-select-input"
                    value={displayValue}
                    placeholder={selectedCategory ? selectedCategory.name : placeholder}
                    disabled={disabled}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsOpen(true)
                        setCreateError('')
                    }}
                    onFocus={() => {
                        if (disabled) return
                        setIsOpen(true)
                        setSearchQuery('')
                    }}
                    aria-required={required}
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    autoComplete="off"
                />
                {isOpen && !disabled && (
                    <div className="category-dropdown" role="listbox" id={listboxId}>
                        {filteredCategories.length > 0 && (
                            <ul className="category-list">
                                {filteredCategories.map((category) => (
                                    <li
                                        key={category._id}
                                        className={`category-option${String(value) === String(category._id) ? ' selected' : ''}`}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectCategory(category)}
                                        role="option"
                                        aria-selected={String(value) === String(category._id)}
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showCreateOption && (
                            <button
                                type="button"
                                className="create-category-option"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleCreateCategory}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating...' : `Create "${trimmedQuery}"`}
                            </button>
                        )}
                        {!filteredCategories.length && !showCreateOption && (
                            <div className="category-no-results">
                                {allowCreate
                                    ? 'No categories yet. Type to create one.'
                                    : 'No matching categories.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {(error || createError) && (
                <div className="category-select-error">{error || createError}</div>
            )}
        </div>
    )
}

export default CategorySelect
