import { useState, useReducer, useRef } from 'react';
import './App.css';
import EditPopup from './Components/EditPopup';
import DeletePopup from './Components/DeletePopup';
import ShoppingListPage from './Pages/ShoppingList';
import Axios from 'axios'
import { deleteItem, updateItem } from './DataHandling';
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
    default:
      throw new Error()
  }
}

function App() {

  const refreshList = () => {
    Axios.get('https://svac-shopping-list.herokuapp.com/read').then((response) => {
      const toGetItems = []
      const inStockItems = []
      response.data.forEach(item => item.isToGet ? toGetItems.push(item) : inStockItems.push(item));
      dispatch({ type: 'updateToGetItems', payload: toGetItems })
      dispatch({ type: 'updateInStockItems', payload: inStockItems })
    })
  }

  const [state, dispatch] = useReducer(reducer, {
    toGetItems: [],
    inStockItems: [],
    listViewed: "Shopping List",
    filterSearchTerm: ''
  })

  const newItem = (item) => {
    dispatch({
      type: item.isToGet ? 'addToGetItem' : 'addinStockItem',
      payload: item
    })
  }

  const [editing, setEditing] = useState({
    isEditing: false,
    editAction: "",
    itemType: "",
    itemName: "",
    itemQuantity: 0,
    itemUnits: "",
    itemID: "",
    indicatingUnits: false,
    indicatingQuantity: false,
  })

  const [deleting, setDeleting] = useState({
    isDeleting: false,
    deleteItemName: "",
    deleteItemId: "",
    deleteItemIsToGet: true
  })

  const edit = (listType, action = "Adding", name, quantity, units, id) => {
    setEditing({
      ...editing,
      isEditing: true,
      editAction: action,
      itemType: listType,
      itemName: name,
      itemQuantity: quantity,
      itemUnits: units,
      itemID: id
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
      itemQuantity: action == "add" ? current + 1 : current != 0 ? current - 1 : 0
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
      itemName: ""
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
    const { _id, quantity, isToGet } = data
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
      units: editing.itemUnits
    }).then(response => {
      let newList = editing.itemType === "Shopping List" ? state.toGetItems : state.inStockItems
      newList = newList.map(item => editing.itemID !== item._id ? item : { ...response.data })
      dispatch({ type: editing.itemType === "Shopping List" ? 'updateToGetItems' : 'updateInStockItems', payload: newList })
    }).catch(err => console.log(err))
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
        refreshList={refreshList}
        addShoppingItem={(name) => edit("Shopping List", "Adding", name)}
        addInStockItem={(name) => edit("In Stock", "Adding", name)}
        setFilterSearchTerm={(term) => dispatch({ type: 'setFilterSearchTerm', payload: term })}
        filterSearchTerm={state.filterSearchTerm}
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

    </div>
  );
}

export default App;
