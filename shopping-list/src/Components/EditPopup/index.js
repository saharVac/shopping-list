import React, { useRef } from 'react'
import { addToList } from '../../DataHandling'
import './style.css'

function EditPopup({ setIndicatingUnits, setIndicatingQuantity, newItem, closeEditPopup, editingInfo, AdjustEditItemQuntity, AdjustEditItemName, AdjustEditItemUnits, saveItem, removeItem }) {

    const itemNameRef = useRef()
    const itemUnitsRef = useRef()
    const indicatingUnitsRef = useRef()
    const indicatingQuantityRef = useRef()

    const { editAction, itemType, itemName, itemQuantity, itemUnits, indicatingUnits, indicatingQuantity } = editingInfo

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
                    className="popup-close-btn"
                    onClick={() => closeEditPopup()}
                >
                    X
                </button>

                <div className="edit-popup-inner-container">

                    <h2 className="edit-title">{editAction} {itemType} Item</h2>

                    <div className="edit-popup-inputs">

                        <div className="edit-popup-input-area">
                            <input
                                type="text"
                                ref={itemNameRef}
                                className="edit-item-name-input edit-item-input"
                                defaultValue={itemName}
                                onChange={() => AdjustEditItemName(itemNameRef.current.value)}
                            />
                        </div>

                        <div className="edit-popup-input-area indicating-units-area">
                            <div className="indicating-units">
                                <input
                                    ref={indicatingUnitsRef}
                                    type="checkbox"
                                    name="units-checkbox"
                                    onChange={() => setIndicatingUnits(indicatingUnitsRef.current.checked)}
                                /> Indicate Units
                            </div>
                            {
                                indicatingUnits ?
                                    <input
                                        ref={itemUnitsRef}
                                        type="text"
                                        className="edit-item-units-input edit-item-input"
                                        defaultValue={itemUnits}
                                        onChange={() => AdjustEditItemUnits(itemUnitsRef.current.value)}
                                    /> :
                                    ""
                            }

                        </div>

                        <div className="edit-popup-input-area indicating-quantity-area">

                            <div className="indicating-quantity">
                                <input
                                    ref={indicatingQuantityRef}
                                    type="checkbox"
                                    name="units-checkbox"
                                    onChange={() => setIndicatingQuantity(indicatingQuantityRef.current.checked)}
                                /> Indicate Quantity
                            </div>

                            {
                                indicatingQuantity ?
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
                                    </div> :
                                    ""
                            }
                        </div>

                    </div>

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
