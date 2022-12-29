import { useState, useReducer } from 'react';
import './App.css';
import EditPopup from './Pages/EditPopup';
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
    listViewed: "Shopping List"
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
  })

  const edit = (listType, action = "Adding", name = "", quantity = 0, units = "", id = "") => {
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

  const closeEditPopup = () => {
    setEditing({
      ...editing,
      isEditing: false
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

  const removeItem = async () => {
    await deleteItem(editing.itemID).then(response => {
      let newList = editing.itemType === "Shopping List" ? state.toGetItems : state.inStockItems
      newList = newList.filter(item => item._id !== editing.itemID)
      dispatch({ type: editing.itemType === "Shopping List" ? 'updateToGetItems' : 'updateInStockItems', payload: newList })
      // clear editing info
      setEditing({
        ...editing,
        isEditing: false,
        editAction: "",
        itemType: "",
        itemName: "",
        itemQuantity: 0,
        itemUnits: "",
        itemID: "",
      })
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

  return (
    <div className="App">

      <ShoppingListPage
        listViewed={state.listViewed}
        edit={edit}
        updateItemIsToGet={updateItemIsToGet}
        updateItemQuantity={updateItemQuantity}
        toGetItems={state.toGetItems}
        inStockItems={state.inStockItems}
        refreshList={refreshList}
        addShoppingItem={() => edit("Shopping List")}
        addInStockItem={() => edit("In Stock")}
      />

      <NavBar
        changeListSelection={changeListSelection}
        listViewed={state.listViewed}
      />

      {
        // conditional display of the edit popup
        editing.isEditing ?
          <EditPopup
            removeItem={removeItem}
            newItem={newItem}
            closeEditPopup={closeEditPopup}
            editingInfo={editing}
            AdjustEditItemQuntity={AdjustEditItemQuntity}
            AdjustEditItemName={AdjustEditItemName}
            AdjustEditItemUnits={AdjustEditItemUnits}
            saveItem={saveItem}
          /> :
          ""
      }
    </div>
  );
}

export default App;
