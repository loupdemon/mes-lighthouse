import axios from "axios";
import {hideInfoMessage, showInfoMessage} from "./infoAction";
import {
    PROD_LOAD_START,
    PROD_LOAD_FINISH,
    PROD_LOAD_SUCCESS,
    PROD_LOAD_ITEM_SUCCESS,
    PROD_CHANGE_ITEM,
    PROD_TEAM_LOAD_SUCCESS,
    PROD_CALC_LOAD_SUCCESS,
    PROD_TEAM_CHANGE,
    PROD_CALC_CHANGE,
    PROD_TARE_CHANGE,
    PROD_TARE_LOAD_SUCCESS,
    PROD_CLEAR_ERROR,
    PROD_SAVE_OK,
    PROD_ADD_NEW_OK,
    PROD_ORIGIN_CALC_LOAD_SUCCESS
} from "./types";
import {
    CARD_STATE_CANCEL,
    CARD_STATE_IN_WORK,
    IProduction,
    IProductionCalc,
    IProductionList,
    IProductionTare,
    IProductionTeam,
    nullProduction,
    nullProductionTare
} from "types/model/production";
import ProductionEndpoint from "services/endpoints/ProductionEndpoint";
import FormulaEndpoint from "services/endpoints/FormulaEndpoint";
import {getRandomInt, MAX_RANDOM_VALUE} from "../../utils/AppUtils";
import {NEW_RECORD_VALUE} from "utils/AppConst";
import AuthenticationService from "services/Authentication.service";


/**
 * Загрузить список произв. карт
 * @param startPeriod - Начало периода
 * @param endPeriod - Окончание периода
 * @param productId - КОд продукта
 * @param state - Состояние
 */
export function loadProductionCards(startPeriod: string, endPeriod: string, findByNum: string, productId?: number, state?: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(hideInfoMessage());
        dispatch(startLoading());
        try {

            const url = ProductionEndpoint.getProductionList(startPeriod, endPeriod, findByNum, productId, state);
            const items: IProductionList[] = [];
            const response = await axios.get(url);
            Object.keys(response.data).forEach((key, index) => {
                items.push({
                    id: response.data[key]['id'],
                    product: response.data[key]['product'],
                    calcValue: response.data[key]['calcValue'],
                    prodStart: response.data[key]['prodStart'],
                    prodFinish: response.data[key]['prodFinish'],
                    leaderName: response.data[key]['leaderName'],
                    state: response.data[key]['state']
                })
            });
            dispatch(successLoadCards(items))
        } catch (e) {
            const errMessage = `Данные не были получены. Ошибка: ${e.toString()}`;
            dispatch(showInfoMessage('error', errMessage));
        }
        dispatch(endLoading())
    }
}

/**
 * Загрузить производственную карту по коду
 * @param id Код записи
 */
export function loadProductionCard(id: number) {
    return async (dispatch: any, getState: any) => {
        const item: IProduction = {...nullProduction};
        if (id === NEW_RECORD_VALUE) {
            dispatch(successLoadCardItem(item))
        }else {
            dispatch(startLoading());
            try {
                const response = await axios.get(ProductionEndpoint.getProductionCard(id));
                item.id = response.data['id'];
                item.comment = response.data['comment'];
                item.calcValue = response.data['calcValue'];
                item.curState = response.data['curState'];
                item.created = response.data['created'];
                item.prodStart = response.data['prodStart'];
                item.prodFinish = response.data['prodFinish'];
                item.lossValue = response.data['lossValue'];
                item.outValue = response.data['outValue'];
                item.product = response.data['product'];
                item.teamLeader = response.data['teamLeader'];
                item.creator = response.data['creator'];
                item.prodLine = response.data['prodLine'];
                item.idFormula = response.data['idFormula'];
                item.formula = response.data['formula']
                dispatch(successLoadCardItem(item))
            } catch (e) {
                dispatch(showInfoMessage('error', e.toString()));
            }
            dispatch(endLoading())
        }
    }
}

/**
 * Удалить производственную карту
 * @param id Код карты
 */
export function deleteProductionCard(id: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(startLoading());
        try{
            const response = await axios.delete(ProductionEndpoint.deleteProductionCard(id));

            if (response.status === 204) {
                const items = [...getState().production.prodCardList];
                const index = items.findIndex((elem, index, array)=>{return elem.id === id});
                items.splice(index, 1);
                dispatch(successLoadCards(items));
            }
            else {
                dispatch(showInfoMessage('error', 'Не удалось удалить запись!'))
            }
        }catch (e) {
            if (e.response.status === 400){
                dispatch(showInfoMessage('error', e.response.data['message']));
            }else{
                dispatch(showInfoMessage('error', 'Не удалось удалить запись!'));
            }
        }
        dispatch(endLoading())
    }
}

/**
 * Получить список смен сотрудников по карте
 * @param id Код карты
 */
export function getProductionTeam(id: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(hideInfoMessage());
        if (id === NEW_RECORD_VALUE){
            dispatch(successLoadTeam([]))
        }else {
            dispatch(startLoading());
            try {
                const url = ProductionEndpoint.getProductionTeam(id);
                const items: IProductionTeam[] = [];
                const response = await axios.get(url);
                Object.keys(response.data).forEach((key, index) => {
                    items.push({
                        id: response.data[key]['id'],
                        manufactureId: id,
                        employee: response.data[key]['employee'],
                        periodStart: response.data[key]['periodStart'],
                        periodEnd: response.data[key]['periodEnd']
                    })
                });
                dispatch(successLoadTeam(items))
            } catch (e) {
                const errMessage = `Данные не были получены. Ошибка: ${e.toString()}`;
                dispatch(showInfoMessage('error', errMessage));
            }
            dispatch(endLoading())
        }
    }
}

export function getProductionOriginalCalc(id: number) {

}

/**
 * Получить список калькуляции производственной карты
 * @param id Код карты
 */
export function getProductionCalc(id: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(hideInfoMessage());
        if (id === NEW_RECORD_VALUE){
            dispatch(successLoadCardCalc([]))
        }else {
            dispatch(startLoading());
            try {
                const url = ProductionEndpoint.getProductionCalc(id);
                const items: IProductionCalc[] = [];
                const response = await axios.get(url);
                Object.keys(response.data).forEach((key, index) => {
                    items.push({
                        id: response.data[key]['id'],
                        manufactureId: id,
                        raw: response.data[key]['raw'],
                        calcValue: response.data[key]['calcValue']
                    })
                });
                dispatch(successLoadCardCalc(items))
            } catch (e) {
                const errMessage = `Данные не были получены. Ошибка: ${e.toString()}`;
                dispatch(showInfoMessage('error', errMessage));
            }
            dispatch(endLoading())
        }
    }
}

/**
 * Получить список готовой продукции в упаковочной таре
 * @param id Код произв. карты
 */
export function getProductionTare(id: number) {
    return async (dispatch: any, getState: any) => {
        dispatch(hideInfoMessage());
        if (id === NEW_RECORD_VALUE) {
            dispatch(successLoadCardTare([]))
        }else {
            dispatch(startLoading());
            try {
                const url = ProductionEndpoint.getProductionTare(id);
                const items: IProductionTare[] = [];
                const response = await axios.get(url);
                Object.keys(response.data).forEach((key, index) => {
                    items.push({
                        id: response.data[key]['id'],
                        tareId: response.data[key]['tareId'],
                        tareName: response.data[key]['tareName'],
                        tareV: response.data[key]['tareV'],
                        count: response.data[key]['count']
                    })
                });
                dispatch(successLoadCardTare(items))
            } catch (e) {
                const errMessage = `Данные не были получены. Ошибка: ${e.toString()}`;
                dispatch(showInfoMessage('error', errMessage));
            }
            dispatch(endLoading())
        }
    }
}

/**
 * Изменить объект смены в массиве
 * @param item Смена
 */
export function updateTeamItem(item: IProductionTeam){
    return async (dispatch: any, getState: any)=> {
        const items = [...getState().production.prodCardTeam];
        const index = items.findIndex((elem: IProductionTeam, index:number, array: IProductionTeam[])=>{return elem.id === item.id});
        items[index].employee = item.employee;
        items[index].periodStart = item.periodStart;
        items[index].periodEnd = item.periodEnd;
        items[index].manufactureId = item.manufactureId;
        dispatch(changeTeamItem(items));
    }
}

/**
 * Изменить объект калькуляции в массиве
 * @param item Калькуляция
 */
export function updateCalcItem(item: IProductionCalc) {
    return async (dispatch: any, getState: any)=> {
        const items = [...getState().production.prodCardCalc];
        const index = items.findIndex((elem: IProductionCalc, index:number, array: IProductionCalc[])=>{return elem.id === item.id});
        items[index].raw = item.raw;
        items[index].calcValue = item.calcValue;
        items[index].manufactureId = item.manufactureId;
        dispatch(changeCalcItem(items));
    }
}

export function updateTareItem(item: IProductionTare) {
    return async (dispatch: any, getState: any)=> {
        const items = [...getState().production.prodCardTare];
        const index = items.findIndex((elem: IProductionTare, index:number, array: IProductionTare[])=>{return elem.id === item.id});
        items[index].tareId = item.tareId;
        items[index].tareName = item.tareName;
        items[index].tareV = item.tareV;
        items[index].count = item.count;
        dispatch(changeTareItem(items));
    }
}

export function changeProductionCard(item: IProduction) {
    return{
        type: PROD_CHANGE_ITEM,
        item: item
    }
}

/**
 * Удалить запись смены по коду  смены
 * @param id Код записи (смены)
 */
export function deleteTeamItem(id: number) {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardTeam];
        const index = items.findIndex((item:IProductionTeam, index: number, array: IProductionTeam[])=> {return item.id === id});
        items.splice(index, 1);
        dispatch(changeTeamItem(items));
    }
}

export function newTeamItem() {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardTeam];
        const newItem = {
            id: -getRandomInt(MAX_RANDOM_VALUE),
            manufactureId: 0,
            employee: {id: 0, tabNum: '', fio: '', staff: ''},
            periodStart: (new Date()).toISOString(),
            periodEnd: (new Date()).toISOString()
        }
        items.push(newItem);
        dispatch(changeTeamItem(items));
    }
}

export function newCalcItem() {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardCalc];
        items.push({
            id: -getRandomInt(MAX_RANDOM_VALUE),
            manufactureId: 0,
            raw: {id: 0, name: ''},
            calcValue: 0
        });
        dispatch(changeCalcItem(items));
    }
}

export function newTareItem() {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardTare];
        let tare = {...nullProductionTare};
        tare.id = -getRandomInt(MAX_RANDOM_VALUE);
        items.push(tare);
        dispatch(changeTareItem(items));
    }
}

export function deleteTareItem(id: number) {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardTare];
        const index = items.findIndex((item:IProductionTare, index: number, array: IProductionTare[])=> {return item.id === id});
        items.splice(index, 1);
        dispatch(changeTareItem(items));
    }
}

/**
 * Удалить запись калькуляции по коду
 * @param id Код записи
 */
export function deleteCalcItem(id: number) {
    return async (dispatch: any, getState: any) => {
        const items = [...getState().production.prodCardCalc];
        const index = items.findIndex((item:IProductionCalc, index: number, array: IProductionCalc[])=> {return item.id === id});
        items.splice(index, 1);
        dispatch(changeCalcItem(items));
    }
}

/**
 * Добавление новой производственной карты
 * @param item
 */
export function addNewProduction(item: IProduction) {
    return async (dispatch: any, getState: any) => {
        dispatch(clearError());
        dispatch(hideInfoMessage());
        try{
            const sendItem = {
                'creator': AuthenticationService.currentEmployeeId(),
                'formula': item.idFormula,
                'prodLine': item.prodLine.id,
                'teamLeader': item.teamLeader.id,
                'prodStart': item.prodStart,
                'prodFinish': item.prodFinish,
                'calcValue': item.calcValue,
                'outValue': item.outValue,
                'lossValue': item.lossValue,
                'comment': item.comment
            };
            const response = await axios.post(ProductionEndpoint.newProductionCard(), sendItem);
            dispatch(showInfoMessage('info', 'Сохранено успешно'))
            const id = response.data['id'];
            const newItem = {...item, id: id}

            dispatch(saveNewRecordOk(newItem))
            console.log('after saveNewRecordOk...')

            // сохранить изменения в калькуляции
            const calcItems = [...getState().production.prodCardCalc];
            let sendCalcItems: any[] = [];
            if (calcItems.length > 0) {
                let idRecord = 0;
                sendCalcItems =
                    calcItems.map((value: IProductionCalc) => {
                        value.manufactureId === 0 ? idRecord = 0 : idRecord = value.id;
                        return(
                            {
                                'id': idRecord,
                                'manufactureId': id,
                                'raw': {
                                    'id': value.raw.id,
                                    'name': value.raw.name
                                },
                                'calcValue': value.calcValue
                            }
                        )
                    });
                const calcResponse = await axios.put(ProductionEndpoint.getProductionCalc(id), sendCalcItems);
                console.log(calcResponse)
            }

            const teamItems = [...getState().production.prodCardTeam];
            if (teamItems.length > 0) {
                teamItems.forEach((value)=>{
                    value.manufactureId = id;
                })
                const teamResponse = await axios.put(ProductionEndpoint.getProductionTeam(id), teamItems);
                console.log(teamResponse);
            }
            const tareItems = [...getState().production.prodCardTare];
            let sendTareItems: any[] = [];
            if (tareItems.length > 0){
                sendTareItems = tareItems.map((value)=>{
                    const newValue = {...value};
                    if (newValue.id < 0) {newValue.id=0}
                    return (
                        newValue
                    )
                })
                const tareResponse = await axios.put(ProductionEndpoint.getProductionTare(id), sendTareItems)
                console.log(tareResponse);
            }
            dispatch(saveOk())

            console.log('id new record:', id)
            return id
        }catch (e) {
            if (e.response.status === 400){
                console.log('data', e.response.data);
                dispatch(showInfoMessage('error', e.response.data['message']));
            }else{
                dispatch(showInfoMessage('error', e.response.toString()));
            }
            return Promise.reject();
        }
    }
}

export function getOriginalCalculation() {
    return async (dispatch: any, getState: any) => {
        const currentCard = getState().production.prodCardItem;
        const calcItems: IProductionCalc[] = [];
        const url = FormulaEndpoint.getCalculation(currentCard.idFormula, currentCard.calcValue);
        console.log(url)
        const response = await axios.get(url);
        Object.keys(response.data.raws).forEach((key, index) => {
            calcItems.push({
                id: response.data.raws[key]['idRaw']['id'],
                manufactureId: 0,
                raw: {
                    id:response.data.raws[key]['idRaw']['id'],
                    name: response.data.raws[key]['idRaw']['name']
                },
                calcValue: response.data.raws[key]['rawCount']
            })
        });
        console.log('ok')
        dispatch(successLoadOriginalCalculation(calcItems))
    }
}

/**
 * Калькуляция на основе выбранной формулы рассчёта
 * Рассчётное количество из введённых данных
 */
export function getAutoCalculation() {
    return async (dispatch: any, getState: any) => {
        const currentCard = getState().production.prodCardItem;
        const calcItems: IProductionCalc[] = [...getState().production.prodCardCalc];
        calcItems.splice(0, calcItems.length); //удалить имеющиейся данные
        const url = FormulaEndpoint.getCalculation(currentCard.idFormula, currentCard.calcValue);
        const response = await axios.get(url);
        Object.keys(response.data.raws).forEach((key, index) => {
            calcItems.push({
                id: response.data.raws[key]['idRaw']['id'],
                manufactureId: 0,
                raw: {
                    id:response.data.raws[key]['idRaw']['id'],
                    name: response.data.raws[key]['idRaw']['name']
                },
                calcValue: response.data.raws[key]['rawCount']
            })
        });
        dispatch(successLoadCardCalc(calcItems))
    }
}

/**
 * Обновить техн. карту
 * @param item Объект карты
 */
export function updateProduction(item: IProduction) {
    return async (dispatch: any, getState: any) => {
        console.log(JSON.stringify(item));
        dispatch(clearError());
        dispatch(hideInfoMessage());
        try{
            const sendItem = {
                'creator': item.creator.id,
                'formula': item.idFormula,
                'prodLine': item.prodLine.id,
                'teamLeader': item.teamLeader.id,
                'prodStart': item.prodStart,
                'prodFinish': item.prodFinish,
                'calcValue': item.calcValue,
                'outValue': item.outValue,
                'lossValue': item.lossValue,
                'comment': item.comment
            };
            console.log(JSON.stringify(sendItem));
            const response = await axios.put(ProductionEndpoint.saveProductionCard(item.id), sendItem);
            dispatch(showInfoMessage('info', 'Сохранено успешно'))
            const id = response.data['id'];

            // сохранить изменения в калькуляции
            const calcItems = [...getState().production.prodCardCalc];
            let sendCalcItems: any[] = [];
            if (calcItems.length > 0) {
                let idRecord = 0;
                sendCalcItems =
                calcItems.map((value: IProductionCalc) => {
                    value.manufactureId === 0 ? idRecord = 0 : idRecord = value.id;
                    return(
                        {
                            'id': idRecord,
                            'manufactureId': id,
                            'raw': {
                                'id': value.raw.id,
                                'name': value.raw.name
                            },
                            'calcValue': value.calcValue
                        }
                    )
                });
                const calcResponse = await axios.put(ProductionEndpoint.getProductionCalc(item.id), sendCalcItems);
                console.log(calcResponse)
            }

            const teamItems = [...getState().production.prodCardTeam];
            if (teamItems.length > 0) {
                teamItems.forEach((value)=>{
                    value.manufactureId = item.id;
                })
                const teamResponse = await axios.put(ProductionEndpoint.getProductionTeam(item.id), teamItems);
                console.log(teamResponse);
            }
            const tareItems = [...getState().production.prodCardTare];
            let sendTareItems: any[] = [];
            if (tareItems.length > 0){
                sendTareItems = tareItems.map((value)=>{
                    const newValue = {...value};
                    if (newValue.id < 0) {newValue.id=0}
                    return (
                        newValue
                    )
                })
                const tareResponse = await axios.put(ProductionEndpoint.getProductionTare(item.id), sendTareItems)
                console.log(tareResponse);
            }

            dispatch(saveOk());

        }catch (e) {
            if (e.response.status === 400){
                console.log('data', e.response.data);
                dispatch(showInfoMessage('error', e.response.data['message']));
            }else{
                dispatch(showInfoMessage('error', e.response.toString()));
            }
        }
    }
}

/**
 * Исполнение карты
 * @param id Код карты
 */
export function executeCard(id: number) {
    return async (dispatch: any, getState: any) => {
        console.log('executeCard', id)
        try{
            const response = await axios.post(ProductionEndpoint.executeProductionCard(id));
            console.log(response)
            if (response.status === 200) {
                dispatch(loadProductionCard(id))
                dispatch(showInfoMessage('info', 'Выполнено'))
            }
        }catch (e) {
            console.log(e)
            const message = e.response.data.message;
            dispatch(showInfoMessage('error', message || e.toString()))
        }
    }
}

/**
 * Перевод карты в работу
 * @param id Код карты
 */
export function sendCardToWork(id: number) {
    return async (dispatch: any, getState: any) => {
        try{
            const response = await axios.post(ProductionEndpoint.changeCardStatus(id, CARD_STATE_IN_WORK));
            if (response.status === 200) {
                dispatch(loadProductionCard(id))
                dispatch(showInfoMessage('info', 'Выполнено'))
            }
        }catch (e) {
            const message = e.response.data.message;
            dispatch(showInfoMessage('error', message || e.toString()))
        }
    }
}

/**
 * Отмена карты
 * @param id Код карты
 */
export function cancelCard(id: number) {
    return async (dispatch: any, getState: any) => {
        try{
            const response = await axios.post(ProductionEndpoint.changeCardStatus(id, CARD_STATE_CANCEL));
            if (response.status === 200) {
                dispatch(loadProductionCard(id))
                dispatch(showInfoMessage('info', 'Выполнено'))
            }
        }catch (e) {
            const message = e.response.data.message;
            dispatch(showInfoMessage('error', message || e.toString()))
        }
    }
}

function changeTareItem(items: IProductionTare[]) {
    return{
        type: PROD_TARE_CHANGE,
        items: items
    }
}

function changeCalcItem(items: IProductionCalc[]) {
    return{
        type: PROD_CALC_CHANGE,
        items: items
    }
}

function saveNewRecordOk(item: IProduction) {
    return{
        type: PROD_ADD_NEW_OK,
        item
    }
}

function changeTeamItem(items: IProductionTeam[]){
    return{
        type: PROD_TEAM_CHANGE,
        items: items
    }
}

function successLoadCardTare(items: IProductionTare[]) {
    return{
        type: PROD_TARE_LOAD_SUCCESS,
        items: items
    }
}

function successLoadTeam(items: IProductionTeam[]) {
    return{
        type: PROD_TEAM_LOAD_SUCCESS,
        items: items
    }
}

function clearError() {
    return{
        type: PROD_CLEAR_ERROR
    }
}

function successLoadCards(items: IProductionList[]) {
    return{
        type: PROD_LOAD_SUCCESS,
        items: items
    }
}

function successLoadCardItem(item: IProduction) {
    return{
        type: PROD_LOAD_ITEM_SUCCESS,
        item: item
    }
}

function successLoadOriginalCalculation(items: IProductionCalc[]) {
    return{
        type: PROD_ORIGIN_CALC_LOAD_SUCCESS,
        items: items
    }
}

function successLoadCardCalc(items: IProductionCalc[]) {
    return{
        type: PROD_CALC_LOAD_SUCCESS,
        items: items
    }
}

function startLoading() {
    return {
        type: PROD_LOAD_START
    }
}

function endLoading() {
    return {
        type: PROD_LOAD_FINISH
    }
}

function saveOk() {
    return{
        type: PROD_SAVE_OK
    }
}
