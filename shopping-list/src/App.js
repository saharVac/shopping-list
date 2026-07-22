import { useState, useReducer, useRef, useCallback } from 'react';
import './App.css';
import EditPopup from './Components/EditPopup';
import DeletePopup from './Components/DeletePopup';
import CategorizePopup from './Components/CategorizePopup';
import ManageCategories from './Components/ManageCategories';
import ShoppingListPage from './Pages/ShoppingList';
import Axios from 'axios'
import {
  deleteItem,
  updateItem,
  fetchCategories,
  reorderCategories,
} from './DataHandling';
import NavBar from './Components/NavBar';

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateToGetItems':
      return {
        ...state,
        toGetItems: action.payload,
      }
    case 'updateInStockItems':
      return {
        ...state,
        inStockItems: action.payload,
      }
    case 'addToGetItem':
      return {
        ...state,
        toGetItems: [
          ...state.toGetItems,
          action.payload
        ],
      }
    case 'addinStockItem':
      return {
        ...state,
        inStockItems: [
          ...state.inStockItems,
          action.payload
        ],
      }
    case 'updateListViewed':
      return {
        ...state,
        listViewed: action.payload
      }
    case 'setFilterSearchTerm':
      return {
        ...state,
        filterSearchTerm: action.payload
      }
    case 'updateCategories':
      return {
        ...state,
        categories: action.payload,
      }
    case 'addCategory':
      return {
        ...state,
        categories: [...state.categories, action.payload].sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order
          return a.name.localeCompare(b.name)
        }),
      }
    case 'updateItemInLists': {
      const item = action.payload
      return {
        ...state,
        toGetItems: state.toGetItems.map((existing) =>
          existing._id === item._id ? { ...item } : existing
        ),
        inStockItems: state.inStockItems.map((existing) =>
          existing._id === item._id ? { ...item } : existing
        ),
      }
    }
    default:
      throw new Error()
  }
}

function App() {

  const [state, dispatch] = useReducer(reducer, {
    toGetItems: [],
    inStockItems: [],
    categories: [],
    listViewed: "Shopping List",
    filterSearchTerm: ''
  })

  const [isCategorizing, setIsCategorizing] = useState(false)
  const [categorizeQueue, setCategorizeQueue] = useState([])
  const [isManagingCategories, setIsManagingCategories] = useState(false)

  const refreshList = useCallback(() => {
    Promise.all([
      Axios.get('https://svac-shopping-list.herokuapp.com/read'),
      fetchCategories(),
    ]).then(([itemsResponse, categoriesResponse]) => {
      const toGetItems = []
      const inStockItems = []
      itemsResponse.data.forEach(item => item.isToGet ? toGetItems.push(item) : inStockItems.push(item));
      dispatch({ type: 'updateToGetItems', payload: toGetItems })
      dispatch({ type: 'updateInStockItems', payload: inStockItems })
      dispatch({ type: 'updateCategories', payload: categoriesResponse.data })
    }).catch(err => console.log(err))
  }, [])

  const newItem = (item) => {
    dispatch({
      type: item.isToGet ? 'addToGetItem' : 'addinStockItem',
      payload: item
    })
  }

  const handleCategoryCreated = (category) => {
    dispatch({ type: 'addCategory', payload: category })
  }

  const handleReorderCategories = async (categoryIds) => {
    const previous = state.categories
    const reordered = categoryIds
      .map((id, index) => {
        const category = previous.find((c) => String(c._id) === String(id))
        return category ? { ...category, order: index } : null
      })
      .filter(Boolean)

    dispatch({ type: 'updateCategories', payload: reordered })

    try {
      const response = await reorderCategories(categoryIds)
      if (response.data.categories) {
        dispatch({ type: 'updateCategories', payload: response.data.categories })
      }
    } catch (err) {
      console.log(err)
      dispatch({ type: 'updateCategories', payload: previous })
    }
  }

  const [editing, setEditing] = useState({
    isEditing: false,
    editAction: "",
    itemType: "",
    itemName: "",
    itemQuantity: 0,
    itemUnits: "",
    itemID: "",
    categoryId: null,
    indicatingUnits: false,
    indicatingQuantity: false,
  })

  const [deleting, setDeleting] = useState({
    isDeleting: false,
    deleteItemName: "",
    deleteItemId: "",
    deleteItemIsToGet: true
  })

  const edit = (listType, action = "Adding", name, quantity, units, id, categoryId = null) => {
    setEditing({
      ...editing,
      isEditing: true,
      editAction: action,
      itemType: listType,
      itemName: name,
      itemQuantity: quantity,
      itemUnits: units,
      itemID: id,
      categoryId: categoryId || null,
    })
  }

  const setEditCategoryId = (categoryId) => {
    setEditing({
      ...editing,
      categoryId,
    })
  }

  const setIndicatingUnits = (bool) => {
    setEditing({
      ...editing,
      indicatingUnits: bool
    })
  }

  const setIndicatingQuantity = (bool) => {
    setEditing({
      ...editing,
      indicatingQuantity: bool,
      itemQuantity: bool ? 1 : 0
    })
  }

  const AdjustEditItemQuntity = (action) => {
    const current = editing.itemQuantity
    setEditing({
      ...editing,
      itemQuantity: action === "add" ? current + 1 : current !== 0 ? current - 1 : 0
    })
  }
  const AdjustEditItemName = (value) => {
    setEditing({
      ...editing,
      itemName: value
    })
  }

  const AdjustEditItemUnits = (value) => {
    setEditing({
      ...editing,
      itemUnits: value
    })
  }

  const newItemNameRef = useRef()

  const closeEditPopup = () => {
    setEditing({
      ...editing,
      isEditing: false,
      indicatingUnits: false,
      indicatingQuantity: false,
      itemQuantity: 0,
      itemName: "",
      categoryId: null,
    })
    newItemNameRef.current.value = ""
    dispatch({ type: 'setFilterSearchTerm', payload: '' })
  }

  const closeDeletePopup = () => {
    setDeleting({
      ...deleting,
      isDeleting: false
    })
  }

  const updateItemQuantity = (data) => {
    const { _id, quantity, isToGet } = data
    let newList = isToGet ? state.toGetItems : state.inStockItems
    newList = newList.map(item => item._id === _id ? { ...item, quantity: quantity } : item)
    dispatch({ type: isToGet ? 'updateToGetItems' : 'updateInStockItems', payload: newList })
  }

  const updateItemIsToGet = (data) => {
    const { _id, isToGet } = data
    let newInStockList = state.inStockItems
    let newShoppingList = state.toGetItems
    if (isToGet) {
      // new item is in shopping list - remove from in stock and add to shopping list
      newInStockList = newInStockList.filter(item => item._id !== _id)
      newShoppingList.push(data)
    } else {
      // new item is in stock list - remove from shopping list and add to in stock 
      newShoppingList = state.toGetItems.filter(item => item._id !== _id)
      newInStockList.push(data)
    }
    dispatch({ type: 'updateToGetItems', payload: newShoppingList })
    dispatch({ type: 'updateInStockItems', payload: newInStockList })
  }

  const saveItem = async () => {
    await updateItem({
      id: editing.itemID,
      itemName: editing.itemName,
      quantity: editing.itemQuantity,
      units: editing.itemUnits,
      categoryId: editing.categoryId,
    }).then(response => {
      let newList = editing.itemType === "Shopping List" ? state.toGetItems : state.inStockItems
      newList = newList.map(item => editing.itemID !== item._id ? item : { ...response.data })
      dispatch({ type: editing.itemType === "Shopping List" ? 'updateToGetItems' : 'updateInStockItems', payload: newList })
    }).catch(err => console.log(err))
  }

  const assignItemCategory = async (item, categoryId) => {
    const response = await updateItem({
      id: item._id,
      categoryId,
    })
    const updated = response.data
    dispatch({ type: 'updateItemInLists', payload: updated })
    return updated
  }

  const removeItem = async (id, isToGet) => {
    await deleteItem(id).then(response => {
      let newList = isToGet ? state.toGetItems : state.inStockItems
      newList = newList.filter(item => item._id !== id)
      dispatch({ type: isToGet ? 'updateToGetItems' : 'updateInStockItems', payload: newList })
      closeDeletePopup()
    }).catch(err => {
      console.log(err)
    })
  }

  const changeListSelection = (list) => {
    // no need to update state unless different list selected
    if (state.listViewed !== list) {
      dispatch({ type: 'updateListViewed', payload: list })
    }
  }

  const updateEditingName = (val) => {
    setEditing({
      ...editing,
      itemName: val
    })
  }

  const showDeletePopup = (itemName, idForDeletion, isToGet) => {
    setDeleting({
      ...deleting,
      isDeleting: true,
      deleteItemName: itemName,
      deleteItemId: idForDeletion,
      deleteItemIsToGet: isToGet
    })
  }

  const uncategorizedItems = [...state.toGetItems, ...state.inStockItems].filter(
    (item) => !item.categoryId
  )

  return (
    <div className="App">

      <ShoppingListPage
        newItemNameRef={newItemNameRef}
        showDeletePopup={showDeletePopup}
        listViewed={state.listViewed}
        edit={edit}
        updateItemIsToGet={updateItemIsToGet}
        updateItemQuantity={updateItemQuantity}
        toGetItems={state.toGetItems}
        inStockItems={state.inStockItems}
        categories={state.categories}
        refreshList={refreshList}
        addShoppingItem={(name) => edit("Shopping List", "Adding", name)}
        addInStockItem={(name) => edit("In Stock", "Adding", name)}
        setFilterSearchTerm={(term) => dispatch({ type: 'setFilterSearchTerm', payload: term })}
        filterSearchTerm={state.filterSearchTerm}
        onReorderCategory={handleReorderCategories}
        uncategorizedCount={uncategorizedItems.length}
        onOpenCategorize={() => {
          setCategorizeQueue(uncategorizedItems)
          setIsCategorizing(true)
        }}
        onOpenManageCategories={() => setIsManagingCategories(true)}
      />

      <NavBar
        changeListSelection={changeListSelection}
        listViewed={state.listViewed}
      />

      {
        // conditional display of the edit popup
        editing.isEditing ?
          <EditPopup
            newItem={newItem}
            closeEditPopup={closeEditPopup}
            editingInfo={editing}
            AdjustEditItemQuntity={AdjustEditItemQuntity}
            AdjustEditItemName={AdjustEditItemName}
            AdjustEditItemUnits={AdjustEditItemUnits}
            saveItem={saveItem}
            updateEditingName={updateEditingName}
            setIndicatingUnits={setIndicatingUnits}
            setIndicatingQuantity={setIndicatingQuantity}
            setEditCategoryId={setEditCategoryId}
            categories={state.categories}
            onCategoryCreated={handleCategoryCreated}
          /> :
          ""
      }

      {
        // conditional display of the delete popup
        deleting.isDeleting ?
          <DeletePopup
            deleting={deleting}
            closeDeletePopup={closeDeletePopup}
            removeItem={removeItem}
          /> :
          ""
      }

      {
        isCategorizing && categorizeQueue.length > 0 ?
          <CategorizePopup
            items={categorizeQueue}
            categories={state.categories}
            onCategoryCreated={handleCategoryCreated}
            onAssignCategory={assignItemCategory}
            onClose={() => {
              setIsCategorizing(false)
              setCategorizeQueue([])
            }}
          /> :
          ""
      }

      {
        isManagingCategories ?
          <ManageCategories
            categories={state.categories}
            items={[...state.toGetItems, ...state.inStockItems]}
            onCategoriesChange={(categories) =>
              dispatch({ type: 'updateCategories', payload: categories })
            }
            onItemsNeedRefresh={refreshList}
            onClose={() => setIsManagingCategories(false)}
          /> :
          ""
      }

    </div>
  );
}

export default App;
