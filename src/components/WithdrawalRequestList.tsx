import React from "react";

export interface WithdrawalRequest {}

export interface WithdrawalRequestListProps {
    requests: string;
}

const WithdrawalRequestList: React.FC<WithdrawalRequestListProps> = (
    props: WithdrawalRequestListProps
): React.ReactElement<WithdrawalRequestListProps> => {
    console.log("XXX");
    console.log(props.requests);
    return (
        <div>
            <h3>Request list</h3>
            <code style={{ whiteSpace: "pre-line" }}>{props.requests}</code>
        </div>
    );
};

export default WithdrawalRequestList;
