import React from 'react'
import Item from '../Item'
import './style.css'

function CategoryGroup({
    category,
    items,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    showDeletePopup,
    listViewed,
    edit,
    updateItemIsToGet,
    updateItemQuantity,
}) {
    const isUncategorized = !category
    const title = isUncategorized ? 'Uncategorized' : category.name

    return (
        <li className={`category-group${isUncategorized ? ' uncategorized' : ''}`}>
            <div className="category-header">
                <h2 className="category-name">{title}</h2>
                {!isUncategorized && (
                    <div className="category-reorder-buttons">
                        <button
                            type="button"
                            className="category-move-btn"
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            aria-label={`Move ${title} up`}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className="category-move-btn"
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            aria-label={`Move ${title} down`}
                        >
                            ↓
                        </button>
                    </div>
                )}
            </div>
            <ul className="category-items">
                {items.map((item) => (
                    <Item
                        key={item._id}
                        showDeletePopup={showDeletePopup}
                        editItem={() => edit(
                            listViewed,
                            'Editing',
                            item.itemName,
                            item.quantity,
                            item.units,
                            item._id,
                            item.categoryId || null
                        )}
                        updateItemIsToGet={updateItemIsToGet}
                        updateItemQuantity={updateItemQuantity}
                        id={item._id}
                        isToGet={item.isToGet}
                        name={item.itemName}
                        quantity={item.quantity}
                        units={item.units}
                    />
                ))}
            </ul>
        </li>
    )
}

export default CategoryGroup
