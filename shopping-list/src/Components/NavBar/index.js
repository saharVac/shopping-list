import React from 'react'
import './style.css'

function NavBar({ changeListSelection, listViewed }) {
    return (
        <nav className="navbar">

            <div
                className={`navitem shopping-list-navitem ${listViewed === "Shopping List" ? "viewedList" : ""}`}
                onClick={() => changeListSelection("Shopping List")}
            >
                Shopping List
            </div>

            <div
                className={`navitem in-stock-navitem ${listViewed === "In Stock" ? "viewedList" : ""}`}
                onClick={() => changeListSelection("In Stock")}
            >
                In Stock
            </div>
        </nav >
    )
}

export default NavBar
