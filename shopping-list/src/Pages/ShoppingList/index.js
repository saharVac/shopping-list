import React, { useEffect } from 'react'
import CategoryGroup from '../../Components/CategoryGroup'
import './style.css'

function ShoppingListPage({
    filterSearchTerm,
    setFilterSearchTerm,
    newItemNameRef,
    showDeletePopup,
    listViewed,
    updateItemQuantity,
    updateItemIsToGet,
    toGetItems,
    inStockItems,
    categories,
    refreshList,
    addShoppingItem,
    addInStockItem,
    edit,
    onReorderCategory,
    uncategorizedCount,
    onOpenCategorize,
    onOpenManageCategories,
}) {

    useEffect(() => {
        refreshList()
    }, [refreshList])

    const isShoppingList = (listViewed === "Shopping List")
    let listItems = isShoppingList ? toGetItems : inStockItems

    const filteredList = (list) => {
        return list
            .filter(item => item.itemName.toLowerCase().includes(filterSearchTerm.toLowerCase()))
            .sort((a, b) => a.itemName.localeCompare(b.itemName))
    }

    const groupItemsByCategory = (items) => {
        const filtered = filteredList(items)
        const groups = []

        categories.forEach((category) => {
            const categoryItems = filtered.filter(
                (item) => item.categoryId && String(item.categoryId) === String(category._id)
            )
            if (categoryItems.length > 0) {
                groups.push({ category, items: categoryItems })
            }
        })

        const uncategorized = filtered.filter((item) => !item.categoryId)
        if (uncategorized.length > 0) {
            groups.push({ category: null, items: uncategorized })
        }

        return groups
    }

    const clearSearch = () => {
        if (newItemNameRef.current) {
            newItemNameRef.current.value = ''
            newItemNameRef.current.focus()
        }
        setFilterSearchTerm('')
    }

    const groups = groupItemsByCategory(listItems)
    const categorizedGroups = groups.filter((group) => group.category)
    const orderedCategoryIds = categories.map((category) => category._id)

    const swapVisibleCategories = (categoryId, direction) => {
        const visibleIndex = categorizedGroups.findIndex(
            (group) => String(group.category._id) === String(categoryId)
        )
        if (visibleIndex < 0) return

        const swapWithIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1
        if (swapWithIndex < 0 || swapWithIndex >= categorizedGroups.length) return

        const currentId = String(categorizedGroups[visibleIndex].category._id)
        const otherId = String(categorizedGroups[swapWithIndex].category._id)
        const nextIds = orderedCategoryIds.map(String)
        const currentPos = nextIds.indexOf(currentId)
        const otherPos = nextIds.indexOf(otherId)
        if (currentPos < 0 || otherPos < 0) return

        nextIds[currentPos] = otherId
        nextIds[otherPos] = currentId
        onReorderCategory(nextIds)
    }

    return (
        <div className="page">

            <h1 className="title">{listViewed}</h1>

            <div className="list-toolbar">
                <button
                    type="button"
                    className="manage-categories-btn"
                    onClick={onOpenManageCategories}
                >
                    Manage categories
                </button>
            </div>

            {uncategorizedCount > 0 && (
                <button
                    type="button"
                    className="categorize-banner-btn"
                    onClick={onOpenCategorize}
                >
                    Categorize {uncategorizedCount} item{uncategorizedCount === 1 ? '' : 's'}
                </button>
            )}

            <div className="add-item-section">

                <div className="search-input-wrap">
                    <i className="fa fa-search search-input-icon" aria-hidden="true"></i>
                    <input
                        ref={newItemNameRef}
                        type="search"
                        className="add-item-name-input"
                        onChange={(e) => setFilterSearchTerm(e.target.value)}
                    />
                    {filterSearchTerm !== '' && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            aria-label="Clear search"
                            onClick={clearSearch}
                        >
                            <i className="fa fa-times" aria-hidden="true"></i>
                        </button>
                    )}
                </div>

                <button
                    className={`add-item-btn ${isShoppingList ? "add-shopping-item-btn" : "add-in-stock-item-btn"}`}
                    onClick={() => {
                        const name = newItemNameRef.current.value
                        if (newItemNameRef.current.value !== '') {
                            isShoppingList ? addShoppingItem(name) : addInStockItem(name)
                        }
                    }}
                >
                    + Add item
                </button>

            </div>

            <ul className={isShoppingList ? "shopping-list" : "in-stock-list"}>
                {groups.map((group) => {
                    const isUncategorized = !group.category
                    const categorizedIndex = isUncategorized
                        ? -1
                        : categorizedGroups.findIndex(
                            (g) => String(g.category._id) === String(group.category._id)
                        )
                    const canMoveUp = categorizedIndex > 0
                    const canMoveDown =
                        categorizedIndex >= 0 && categorizedIndex < categorizedGroups.length - 1

                    return (
                        <CategoryGroup
                            key={group.category ? group.category._id : 'uncategorized'}
                            category={group.category}
                            items={group.items}
                            canMoveUp={canMoveUp}
                            canMoveDown={canMoveDown}
                            onMoveUp={() => swapVisibleCategories(group.category._id, 'up')}
                            onMoveDown={() => swapVisibleCategories(group.category._id, 'down')}
                            showDeletePopup={showDeletePopup}
                            listViewed={listViewed}
                            edit={edit}
                            updateItemIsToGet={updateItemIsToGet}
                            updateItemQuantity={updateItemQuantity}
                        />
                    )
                })}
            </ul>

        </div>
    )
}

export default ShoppingListPage
