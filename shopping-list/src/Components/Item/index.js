import React from 'react'
import { adjustItemIsToGet, adjustItemQuantity } from '../../DataHandling'
import './style.css'

function Item({ showDeletePopup, id, name, quantity, units, isToGet, updateItemQuantity, updateItemIsToGet, editItem }) {

    const adjustQuantity = async (isAdding) => {
        // execute as long as not subtracting from 1
        if (!(!isAdding && quantity === 1)) {
            await adjustItemQuantity(id, isAdding ? quantity + 1 : quantity - 1).then((res) => {
                updateItemQuantity(res.data)
            })
        } else {
            console.log("can't subtract from 1")
        }
    }

    const switchIsToGet = async () => {
        await adjustItemIsToGet(id, !isToGet).then((res) => {
            updateItemIsToGet(res.data)
        })

    }

    return (
        <li className="item">

            <div className="item-title">{name}</div>

            {
                quantity ?
                    <div className="item-amount-container">

                        <button
                            className="quantity-update-btn reduce-quantity-btn"
                            onClick={() => adjustQuantity(false)}
                        >
                            -
                    </button>

                        <div className="item-amount">
                            <div className="item-quantity">{quantity}</div>
                            {
                                units ?
                                    <div className="item-units">{units}</div>
                                    : ""
                            }

                        </div>

                        <button
                            className="quantity-update-btn add-quantity-btn"
                            onClick={() => adjustQuantity(true)}
                        >
                            +
                    </button>

                    </div> :
                    ""



            }

            <div className="item-action-buttons">
                <button
                    className="action-btn"
                    onClick={() => editItem()}
                >
                    Edit
                </button>
                <button
                    className="action-btn"
                    id="delete-btn"
                    onClick={() => showDeletePopup(name, id, isToGet)}
                >
                    <i className="fa fa-trash"></i>
                    Delete
                </button>
                <button
                    className="action-btn"
                    onClick={() => switchIsToGet()}
                >
                    {isToGet ? "Purchased" : "Ran Out"}
                </button>
            </div>

        </li>
    )
}

export default Item
