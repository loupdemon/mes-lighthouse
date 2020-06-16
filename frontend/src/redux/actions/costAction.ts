import axios from "axios";
import {hideInfoMessage, showInfoMessage} from "./infoAction";
import CostEndpoint from "services/endpoints/CostEndpoint";
import {ICost, ICostSimple} from "types/model/cost";
import {
    COST_CHANGE_ITEM, COST_CLEAR_ERROR,
    COST_DELETE_OK,
    COST_LOAD_FINISH,
    COST_LOAD_ITEM_SUCCESS,
    COST_LOAD_PARENT_ITEMS,
    COST_LOAD_START,
    COST_LOAD_SUCCESS, COST_SAVE_OK, COST_SET_ERROR
} from "./types";
import {NEW_RECORD_VALUE} from "utils/AppConst";


/**
 * Загрузить список видов затрат
 */
export function getCostList() {
    return async (dispatch: any, getState: any) => {
        dispatch(fetchStart());
        dispatch(hideInfoMessage());
        try {
            const url = CostEndpoint.getCostList();
            const items: ICost[] = [];
            const response = await axios.get(url);
            console.log(response);
            Object.keys(response.data).forEach((key, index) => {
                items.push(response.data[key])
            });
            dispatch(fetchSuccess(items))
        } catch (e) {
            dispatch(showInfoMessage('error', e.toString()))
        }
        dispatch(fetchFinish())
    }
}

/**
 * Получить элемент статьи затрат
 * @param id
 */
export function getCostItem(id: number) {
    return async (dispatch: any, getState: any) => {
        let item: ICost = {id: 0, name: "", childs: [], parent: 0};
        if (id === NEW_RECORD_VALUE) {
            dispatch(fetchItemSuccess(item))
            return undefined
        }
        dispatch(fetchStart());
        try{
            const response = await axios.get(CostEndpoint.getCostItem(id))
            item.id = response.data['id']
            item.name = response.data['name']
            item.parent = response.data['parent']
            dispatch(fetchItemSuccess(item))
        }catch (e) {
            dispatch(showInfoMessage('error', e.toString()))
        }
        dispatch(fetchFinish())
    }
}

/**
 * Получить затраты первого уровня
 */
export function getFirstLevelCost() {
    return async (dispatch: any, getState: any) => {
        dispatch(fetchStart());
        dispatch(hideInfoMessage());
        try {
            const url = CostEndpoint.getCostList();
            const items: ICostSimple[] = [];
            const response = await axios.get(url);
            Object.keys(response.data).forEach((key, index) => {
                items.push({id: response.data[key]['id'], name: response.data[key]['name']})
            });
            dispatch(fetchFirstLevelItems(items))
        } catch (e) {
            dispatch(showInfoMessage('error', e.toString()))
        }
        dispatch(fetchFinish())
    }
}

export function deleteCostItem(id: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(fetchStart());
        try{
            const response = await axios.delete(CostEndpoint.deleteCost(id));
            if (response.status === 204) {
                const items = [...getState().cost.items];
                const index = items.findIndex((elem, index, array)=>{return elem.id === id});
                items.splice(index, 1);
                dispatch(deleteOk(items));
                dispatch(showInfoMessage('info', 'Запись успешно удалена'))
            }
            else {
                dispatch(showInfoMessage('error', `Неизвестная ошибка при удалении: ${response.status.toString()}`))
            }
        }catch (e) {
            dispatch(showInfoMessage('error', `Не удалось удалить запись ${e.toString()}!`))
        }
        dispatch(fetchFinish())
    }
}

export function addNewCost(item: ICost) {
    return async (dispatch: any, getState: any) => {
        dispatch(clearError());
        try{
            await axios.post(CostEndpoint.newCost(), item);
            dispatch(saveOk(item));
            return Promise.resolve();
        }
        catch (e) {
            dispatch(saveError('Не удалось добавить новую запись!'));
            return Promise.reject();
        }
    }
}

export function updateCost(item: ICost) {
    return async (dispatch: any, getState: any) => {
        try{
            await axios.put(CostEndpoint.updateCost(item.id), item);
        }catch (e) {
            dispatch(saveError(e.toString()))
        }
    }
}



export function changeCost(item: ICost) {
    return{
        type: COST_CHANGE_ITEM,
        item
    }
}

function saveError(e: string) {
    return{
        type: COST_SET_ERROR,
        error: e
    }
}

function clearError() {
    return{
        type: COST_CLEAR_ERROR
    }
}

function saveOk(item: ICost) {
    return{
        type: COST_SAVE_OK,
        item
    }
}

function deleteOk(items: ICost[]) {
    return{
        type: COST_DELETE_OK,
        items
    }
}

function fetchStart() {
    return {
        type: COST_LOAD_START
    }
}

function fetchItemSuccess(item: ICost) {
    return {
        type: COST_LOAD_ITEM_SUCCESS,
        item
    }
}

function fetchFinish() {
    return{
        type: COST_LOAD_FINISH
    }
}

function fetchSuccess(items: ICost[]) {
    return{
        type: COST_LOAD_SUCCESS,
        items
    }
}

function fetchFirstLevelItems(items: ICostSimple[]) {
    return{
        type: COST_LOAD_PARENT_ITEMS,
        items
    }
}