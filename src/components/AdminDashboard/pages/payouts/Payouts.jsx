import React from 'react';
import PayoutTable from './_components/PayoutTable';
import { useGetAllPayoutsQuery } from '../../../../redux/slices/Apis/dashboardApis';

const Payouts = () => {
    const {data:payouts} = useGetAllPayoutsQuery()
    return (
        <div>
            <PayoutTable payouts={payouts} />
        </div>
    );
};

export default Payouts;