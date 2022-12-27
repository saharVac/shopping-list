import React, { useRef } from 'react'
import { addToList } from '../../DataHandling'
import './style.css'

function EditPopup({ newItem, closeEditPopup, editingInfo, AdjustEditItemQuntity, AdjustEditItemName, AdjustEditItemUnits, saveItem, removeItem }) {

    const itemNameRef = useRef()
    const itemUnitsRef = useRef()

    const { editAction, itemType, itemName, itemQuantity, itemUnits } = editingInfo

    const addItem = async () => {
        const isToGet = itemType == "Shopping List"
        await addToList({
            itemName: itemName,
            quantity: itemQuantity,
            units: itemUnits,
            isToGet: isToGet
        }).then((res) => {
            newItem(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className="edit-popup">
            <div className="edit-popup-inner">

                <button
                    className="edit-popup-close-btn"
                    onClick={() => closeEditPopup()}
                >
                    X
                </button>

                <div className="edit-popup-inner-container">

                    <h2 className="edit-title">{editAction} {itemType} Item</h2>

                    <div className="edit-popup-inputs">

                        <div className="edit-popup-input-area">
                            <div className="edit-popup-input-title">Name</div>
                            <input
                                type="text"
                                ref={itemNameRef}
                                className="edit-item-name-input"
                                defaultValue={itemName}
                                onChange={() => AdjustEditItemName(itemNameRef.current.value)}
                            />
                        </div>

                        <div className="edit-popup-input-area">
                            <div className="edit-popup-input-title">Units</div>
                            <input
                                ref={itemUnitsRef}
                                type="text"
                                className="edit-item-units-input"
                                defaultValue={itemUnits}
                                onChange={() => AdjustEditItemUnits(itemUnitsRef.current.value)}
                            />
                        </div>

                        <div className="edit-popup-input-area">
                            <div className="edit-popup-input-title">Quantity</div>

                            <div className="edit-popup-quantity-area">
                                <div
                                    className="edit-quantity-btn subtract-edit-quantity-btn"
                                    onClick={() => AdjustEditItemQuntity("subtract")}
                                >
                                    -
                                </div>
                                <span className="edit-quantity">{itemQuantity}</span>
                                <div
                                    className="edit-quantity-btn add-edit-quantity-btn"
                                    onClick={() => AdjustEditItemQuntity("add")}
                                >
                                    +
                                </div>
                            </div>
                        </div>

                    </div>

                    {
                        editAction !== "Adding" ?
                            <button
                                className="delete-btn"
                                onClick={() => removeItem()}
                            >
                                Delete Item
                            </button> :
                            ""
                    }

                    <button
                        className="edit-submit-btn"
                        onClick={() => {
                            editAction == "Adding" ?
                                addItem() :
                                saveItem()
                            closeEditPopup()
                        }}
                    >
                        {editAction == "Adding" ? "Add" : "Save"}
                    </button>

                </div>

            </div>
        </div>
    )
}

export default EditPopup
