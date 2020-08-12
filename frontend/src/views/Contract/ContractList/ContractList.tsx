import React, {useEffect, useState} from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import CircularIndeterminate from "components/Loader/Loader";
import {ContractTable, ContractToolbar} from '../components';
import {deleteContract, loadContractList} from "redux/actions/contractAction";
import {useDispatch, useSelector} from "react-redux";
import {IStateInterface} from "redux/rootReducer";
import {NO_SELECT_VALUE} from "../../../utils/AppConst";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3)
    },
    content: {
        marginTop: theme.spacing(2)
    }
}));

const ContractList = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()

    // @ts-ignore
    const isLoading = useSelector((state: IStateInterface) => state.contract.isLoading)
    const clients = useSelector((state: IStateInterface) => state.contract.items)
    const [selected, setSelected] = useState<number[]>([])
    const [contractStatus, setContractStatus] = useState(NO_SELECT_VALUE)

    useEffect(() => {
        dispatch(loadContractList(contractStatus))
    }, [dispatch, contractStatus]);

    function onClickTableItem(contractId: number){
        history.push(`/contracts/${contractId}?source=contract`);
    }

    async function onFindClientHandler(findNum: string){
        dispatch(loadContractList(-1, findNum))
    }

    function onDeleteHandle() {
        selected.forEach(async (item, i, selected) => {
            dispatch(deleteContract(item))
        });
    }

    function onNewItemHandler() {
        history.push('/contracts/new');
    }

    return (
        <div className={classes.root}>
            <ContractToolbar
                className={''}
                onFind={onFindClientHandler}
                onNew={onNewItemHandler}
                onDelete={onDeleteHandle}
                contractState={contractStatus}
                onSetState={setContractStatus}
            />
            <div className={classes.content}>
                {
                    isLoading ? <CircularIndeterminate/>
                        : <ContractTable
                            contracts={clients}
                            className={''}
                            onClickItem={onClickTableItem}
                            onChangeSelected={setSelected}
                        />
                }
            </div>
        </div>
    );
};

export default ContractList;
