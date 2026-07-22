import Axios from 'axios'

const API_BASE = 'https://svac-shopping-list.herokuapp.com'

export const addToList = (item) => {
    return Axios.post(`${API_BASE}/insert`, {
        itemName: item.itemName,
        quantity: item.quantity,
        units: item.units,
        isToGet: item.isToGet,
        categoryId: item.categoryId,
    })
}

export const updateItem = (updatedItem) => {
    return Axios.put(`${API_BASE}/update`, {
        id: updatedItem._id,
        ...updatedItem
    })
}

export const adjustItemQuantity = (id, newQuantity) => {
    return Axios.put(`${API_BASE}/update`, {
        id: id,
        quantity: newQuantity,
    })
}

export const adjustItemIsToGet = (id, newIsToGet) => {
    return Axios.put(`${API_BASE}/update`, {
        id: id,
        isToGet: newIsToGet,
    })
}

export const deleteItem = (id) => {
    return Axios.delete(`${API_BASE}/delete/${id}`)
}

export const fetchCategories = () => {
    return Axios.get(`${API_BASE}/categories`)
}

export const createCategory = (name) => {
    return Axios.post(`${API_BASE}/categories`, { name })
}

export const updateCategory = (id, fields) => {
    return Axios.put(`${API_BASE}/categories`, { id, ...fields })
}

export const reorderCategories = (categoryIds) => {
    return Axios.put(`${API_BASE}/categories/reorder`, { categoryIds })
}

export const deleteCategory = (id) => {
    return Axios.delete(`${API_BASE}/categories/${id}`)
}

export const mergeCategories = (sourceId, targetId) => {
    return Axios.post(`${API_BASE}/categories/merge`, { sourceId, targetId })
}
