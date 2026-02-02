import React from 'react'
import './style.css'

function DeletePopup({ closeDeletePopup, deleting, removeItem }) {

    const { deleteItemName, deleteItemId, deleteItemIsToGet } = deleting

    return (
        <div className="delete-popup">
            <div className="delete-popup-inner">

                <div className="close-popup-container">
                    <button
                        className="popup-close-btn"
                        onClick={() => closeDeletePopup()}
                    >
                        X
                    </button>
                </div>


                <div className="delete-popup-inner-container">
                    <h2 className="delete-prompt">Are you sure you want to delete <span className="deleteItemName">{deleteItemName}</span>?</h2>
                </div>

                <button
                    className="delete-confirmation-btn"
                    onClick={() => removeItem(deleteItemId, deleteItemIsToGet)}
                >
                    Yes
                </button>

            </div>
        </div>
    )
}

export default DeletePopup
