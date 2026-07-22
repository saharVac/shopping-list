import React, { useMemo, useRef, useState } from 'react'
import {
    createCategory,
    updateCategory,
    deleteCategory,
    mergeCategories,
    reorderCategories,
} from '../../DataHandling'
import CategorySelect from '../CategorySelect'
import './style.css'

function ManageCategories({
    categories,
    items,
    onCategoriesChange,
    onItemsNeedRefresh,
    onClose,
}) {
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')
    const [newName, setNewName] = useState('')
    const [mergeSourceId, setMergeSourceId] = useState('')
    const [mergeTargetId, setMergeTargetId] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [draggingId, setDraggingId] = useState(null)
    const [dragOverId, setDragOverId] = useState(null)
    const dragSourceIdRef = useRef(null)

    const countsByCategory = useMemo(() => {
        const counts = {}
        items.forEach((item) => {
            if (!item.categoryId) return
            const key = String(item.categoryId)
            counts[key] = (counts[key] || 0) + 1
        })
        return counts
    }, [items])

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order
            return a.name.localeCompare(b.name)
        }),
        [categories]
    )

    const run = async (fn) => {
        setBusy(true)
        setError('')
        try {
            await fn()
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setBusy(false)
        }
    }

    const persistOrder = async (nextIds) => {
        const previous = categories
        const optimistic = nextIds
            .map((id, order) => {
                const category = categories.find((c) => String(c._id) === String(id))
                return category ? { ...category, order } : null
            })
            .filter(Boolean)
        onCategoriesChange(optimistic)

        try {
            const response = await reorderCategories(nextIds)
            if (response.data.categories) {
                onCategoriesChange(response.data.categories)
            }
        } catch (err) {
            onCategoriesChange(previous)
            throw err
        }
    }

    const moveCategoryToIndex = (sourceId, targetIndex) => run(async () => {
        const ids = sortedCategories.map((category) => String(category._id))
        const fromIndex = ids.indexOf(String(sourceId))
        if (fromIndex < 0 || targetIndex < 0 || targetIndex >= ids.length || fromIndex === targetIndex) {
            return
        }

        const nextIds = [...ids]
        const [moved] = nextIds.splice(fromIndex, 1)
        nextIds.splice(targetIndex, 0, moved)
        await persistOrder(nextIds)
    })

    const handleCreate = () => run(async () => {
        const name = newName.trim()
        if (!name) {
            setError('Enter a category name')
            return
        }
        const response = await createCategory(name)
        onCategoriesChange([...categories, response.data].sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order
            return a.name.localeCompare(b.name)
        }))
        setNewName('')
    })

    const startRename = (category) => {
        setEditingId(category._id)
        setEditName(category.name)
        setError('')
        setConfirmDeleteId(null)
    }

    const saveRename = (categoryId) => run(async () => {
        const name = editName.trim()
        if (!name) {
            setError('Name cannot be empty')
            return
        }
        const response = await updateCategory(categoryId, { name })
        onCategoriesChange(
            categories.map((category) =>
                String(category._id) === String(categoryId) ? response.data : category
            )
        )
        setEditingId(null)
        setEditName('')
    })

    const handleDelete = (categoryId) => run(async () => {
        await deleteCategory(categoryId)
        onCategoriesChange(
            categories.filter((category) => String(category._id) !== String(categoryId))
        )
        onItemsNeedRefresh()
        setConfirmDeleteId(null)
        if (String(mergeSourceId) === String(categoryId)) setMergeSourceId('')
        if (String(mergeTargetId) === String(categoryId)) setMergeTargetId('')
    })

    const clearDragState = () => {
        dragSourceIdRef.current = null
        setDraggingId(null)
        setDragOverId(null)
    }

    const findCategoryIdAtPoint = (clientX, clientY) => {
        const el = document.elementFromPoint(clientX, clientY)
        const row = el?.closest?.('[data-category-id]')
        return row ? row.getAttribute('data-category-id') : null
    }

    const finishDrag = (targetId) => {
        const sourceId = dragSourceIdRef.current
        clearDragState()
        if (!sourceId || !targetId || String(sourceId) === String(targetId) || busy) return

        const targetIndex = sortedCategories.findIndex(
            (category) => String(category._id) === String(targetId)
        )
        if (targetIndex < 0) return
        moveCategoryToIndex(sourceId, targetIndex)
    }

    const onHandleDragStart = (event, categoryId) => {
        if (busy || editingId) {
            event.preventDefault()
            return
        }
        dragSourceIdRef.current = String(categoryId)
        setDraggingId(String(categoryId))
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(categoryId))
        try {
            event.dataTransfer.setData('application/x-category-id', String(categoryId))
        } catch (_) {
            // some browsers restrict custom types
        }
    }

    const onRowDragOver = (event, categoryId) => {
        if (!dragSourceIdRef.current) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        if (String(dragOverId) !== String(categoryId)) {
            setDragOverId(String(categoryId))
        }
    }

    const onRowDrop = (event, categoryId) => {
        event.preventDefault()
        const fromData =
            event.dataTransfer.getData('application/x-category-id') ||
            event.dataTransfer.getData('text/plain') ||
            dragSourceIdRef.current
        dragSourceIdRef.current = fromData
        finishDrag(categoryId)
    }

    const onHandlePointerDown = (event, categoryId) => {
        if (busy || editingId || event.pointerType === 'mouse') return
        event.preventDefault()
        dragSourceIdRef.current = String(categoryId)
        setDraggingId(String(categoryId))
        event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    const onHandlePointerMove = (event) => {
        if (!dragSourceIdRef.current || event.pointerType === 'mouse') return
        const overId = findCategoryIdAtPoint(event.clientX, event.clientY)
        if (overId && String(dragOverId) !== String(overId)) {
            setDragOverId(String(overId))
        }
    }

    const onHandlePointerUp = (event) => {
        if (!dragSourceIdRef.current || event.pointerType === 'mouse') return
        const overId = findCategoryIdAtPoint(event.clientX, event.clientY) || dragOverId
        finishDrag(overId)
    }

    const handleMerge = () => run(async () => {
        if (!mergeSourceId || !mergeTargetId) {
            setError('Pick both categories to consolidate')
            return
        }
        if (String(mergeSourceId) === String(mergeTargetId)) {
            setError('Choose two different categories')
            return
        }
        const response = await mergeCategories(mergeSourceId, mergeTargetId)
        if (response.data.categories) {
            onCategoriesChange(response.data.categories)
        }
        onItemsNeedRefresh()
        setMergeSourceId('')
        setMergeTargetId('')
    })

    const sourceName = sortedCategories.find((c) => String(c._id) === String(mergeSourceId))?.name
    const targetName = sortedCategories.find((c) => String(c._id) === String(mergeTargetId))?.name

    return (
        <div className="manage-categories-popup">
            <div className="manage-categories-inner">
                <div className="manage-categories-header">
                    <button type="button" className="popup-close-btn manage-categories-close" onClick={onClose}>
                        X
                    </button>
                </div>

                <div className="manage-categories-content">
                    <h2 className="manage-categories-title">Manage categories</h2>

                    <div className="manage-create-row">
                        <input
                            type="text"
                            className="manage-input"
                            placeholder="New category name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={busy}
                        />
                        <button
                            type="button"
                            className="manage-primary-btn"
                            onClick={handleCreate}
                            disabled={busy}
                        >
                            Add
                        </button>
                    </div>

                    <p className="manage-section-help manage-reorder-help">
                        Drag the handle to reorder categories.
                    </p>

                    <ul className="manage-category-list">
                        {sortedCategories.map((category) => {
                            const count = countsByCategory[String(category._id)] || 0
                            const isEditing = String(editingId) === String(category._id)
                            const confirmingDelete = String(confirmDeleteId) === String(category._id)
                            const isDragging = String(draggingId) === String(category._id)
                            const isDragOver =
                                String(dragOverId) === String(category._id) &&
                                String(draggingId) !== String(category._id)

                            return (
                                <li
                                    key={category._id}
                                    data-category-id={category._id}
                                    className={[
                                        'manage-category-row',
                                        isDragging ? 'dragging' : '',
                                        isDragOver ? 'drag-over' : '',
                                    ].filter(Boolean).join(' ')}
                                    onDragOver={(e) => onRowDragOver(e, category._id)}
                                    onDrop={(e) => onRowDrop(e, category._id)}
                                    onDragEnter={(e) => onRowDragOver(e, category._id)}
                                >
                                    <div className="manage-category-top">
                                        <div className="manage-category-main">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="manage-input manage-rename-input"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    disabled={busy}
                                                />
                                            ) : (
                                                <span className="manage-category-name">{category.name}</span>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="manage-category-meta">
                                                <span className="manage-category-count">
                                                    {count} item{count === 1 ? '' : 's'}
                                                </span>
                                                <div
                                                    className="manage-drag-handle"
                                                    role="button"
                                                    tabIndex={busy ? -1 : 0}
                                                    draggable={!busy}
                                                    aria-label={`Drag to reorder ${category.name}`}
                                                    aria-disabled={busy}
                                                    title="Drag to reorder"
                                                    onDragStart={(e) => onHandleDragStart(e, category._id)}
                                                    onDragEnd={clearDragState}
                                                    onPointerDown={(e) => onHandlePointerDown(e, category._id)}
                                                    onPointerMove={onHandlePointerMove}
                                                    onPointerUp={onHandlePointerUp}
                                                    onPointerCancel={clearDragState}
                                                >
                                                    <span className="manage-drag-grip" aria-hidden="true">⋮⋮</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="manage-category-actions">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn"
                                                    disabled={busy}
                                                    onClick={() => saveRename(category._id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn"
                                                    disabled={busy}
                                                    onClick={() => {
                                                        setEditingId(null)
                                                        setEditName('')
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : confirmingDelete ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn manage-danger-btn"
                                                    disabled={busy}
                                                    onClick={() => handleDelete(category._id)}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn"
                                                    disabled={busy}
                                                    onClick={() => setConfirmDeleteId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn"
                                                    disabled={busy}
                                                    onClick={() => startRename(category)}
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    type="button"
                                                    className="manage-small-btn manage-danger-btn"
                                                    disabled={busy}
                                                    onClick={() => setConfirmDeleteId(category._id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                        {sortedCategories.length === 0 && (
                            <li className="manage-empty">No categories yet.</li>
                        )}
                    </ul>

                    <div className="manage-merge-section">
                        <h3 className="manage-section-title">Consolidate</h3>
                        <p className="manage-section-help">
                            Move all items from one category into another, then remove the empty one.
                        </p>
                        <div className="manage-merge-fields">
                            <CategorySelect
                                value={mergeSourceId || null}
                                onChange={(id) => {
                                    setMergeSourceId(id)
                                    setError('')
                                }}
                                categories={sortedCategories}
                                allowCreate={false}
                                required={false}
                                label="Merge from"
                                placeholder="Search category…"
                                disabled={busy}
                                excludeIds={mergeTargetId ? [mergeTargetId] : []}
                            />
                            <div className="manage-merge-arrow" aria-hidden="true">↓</div>
                            <CategorySelect
                                value={mergeTargetId || null}
                                onChange={(id) => {
                                    setMergeTargetId(id)
                                    setError('')
                                }}
                                categories={sortedCategories}
                                allowCreate={false}
                                required={false}
                                label="Into"
                                placeholder="Search category…"
                                disabled={busy}
                                excludeIds={mergeSourceId ? [mergeSourceId] : []}
                            />
                        </div>
                        {sourceName && targetName && String(mergeSourceId) !== String(mergeTargetId) && (
                            <p className="manage-merge-preview">
                                Merge “{sourceName}” into “{targetName}”
                            </p>
                        )}
                        <button
                            type="button"
                            className="manage-primary-btn manage-merge-btn"
                            onClick={handleMerge}
                            disabled={busy || !mergeSourceId || !mergeTargetId}
                        >
                            Consolidate
                        </button>
                    </div>

                    {error && <div className="manage-error">{error}</div>}
                </div>
            </div>
        </div>
    )
}

export default ManageCategories
