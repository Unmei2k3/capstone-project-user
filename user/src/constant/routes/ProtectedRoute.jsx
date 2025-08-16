import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../redux/slices/messageSlice';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const dispatch = useDispatch();
    const { accessToken, isInitializing, user } = useSelector((state) => state.user);
    const [redirectToLogin, setRedirectToLogin] = useState(false);

    useEffect(() => {
        if (!isInitializing && (!user || !accessToken)) {
            dispatch(setMessage({
                type: 'error',
                content: 'Vui lòng đăng nhập trước khi thực hiện thao tác này!'
            }));
            setTimeout(() => {
                setRedirectToLogin(true);
            }, 1000);
        }
    }, [isInitializing, user, accessToken, dispatch]);

    if (isInitializing) {
        return <div>...Loading</div>;
    }

    if (redirectToLogin) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
        dispatch(setMessage({
            type: 'error',
            content: 'Bạn không có quyền truy cập trang này!',
        }));
        return <Navigate to="/unauthorized" replace />;
    }
    if (!user || !accessToken) {
        return <div></div>;
    }

    return children;
};

export default ProtectedRoute;
