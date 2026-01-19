import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { fetchMe } from "./authThunks";
import { setBootstrapped, logout } from "./authSlice";

export const useAuthBootstrap = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            dispatch(setBootstrapped());
            return;
        }

        dispatch(fetchMe())
            .unwrap()
            .catch(() => {
                dispatch(logout());
            }).finally(() => {
                dispatch(setBootstrapped());
            });

    }, [dispatch]);
}