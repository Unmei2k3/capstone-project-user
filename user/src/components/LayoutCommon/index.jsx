import { Outlet, Link } from "react-router-dom";
import { Button, Dropdown, Layout, message } from 'antd';
import "./style.scss";
import { UserOutlined, CaretDownOutlined, TikTokOutlined, FacebookOutlined, YoutubeOutlined, MenuOutlined, ProfileOutlined, LoginOutlined, BellOutlined, FileTextOutlined, LogoutOutlined, MessageOutlined, CalendarOutlined, KeyOutlined } from '@ant-design/icons';
import { Menu } from "antd";
import logo from "../../assets/images/dabs-logo.png"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import { useEffect } from "react";
import { clearMessage, setMessage } from "../../redux/slices/messageSlice";
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
const { SubMenu } = Menu;
const { Header, Footer } = Layout;
function LayoutCommon() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    console.log("User in LayoutCommon:", user);
    const screens = useBreakpoint();
    const isMobile = !screens.lg;
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);


    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,

            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);

    const handleLogout = () => {
        try {
            dispatch(logout());
            dispatch(setMessage({ type: 'success', content: 'Đăng xuất thành công!' }));
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: 'Đăng xuất thất bại. Vui lòng thử lại!' }));
        };
    }

    const dropdownMenu = (
        <Menu>
            <Menu.Item key="chat" icon={<MessageOutlined />} onClick={() => navigate('/chat')}>
                Trò chuyện với DABS Bot
            </Menu.Item>
            {user ? (
                <>
                    <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                        Thông tin cá nhân
                    </Menu.Item>
                    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                    Đăng nhập
                </Menu.Item>
            )}
        </Menu>
    );

    const accountMenu = (
        <Menu>
            <Menu.Item key="greeting" disabled icon={<UserOutlined />}>
                {user ? (user.fullname?.trim() || user.email || 'khách') : 'khách'}
            </Menu.Item>
            <Menu.Divider />
            {user ? (
                <>
                    <Menu.Item
                        key="booking-history"
                        onClick={() => navigate('/booking-history')}
                        icon={<CalendarOutlined />}
                    >
                        Lịch sử đặt khám
                    </Menu.Item>
                    <Menu.Item key="profile" onClick={() => navigate('/profile')} icon={<UserOutlined />}>
                        Thông tin cá nhân
                    </Menu.Item>
                    <Menu.Item
                        key="password"
                        onClick={() => navigate('/profile/change-password')}
                        icon={<KeyOutlined />}
                    >
                        Đổi mật khẩu
                    </Menu.Item>
               
                 
                    <Menu.Divider />
                    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                    Đăng nhập
                </Menu.Item>
            )}
        </Menu>
    );

    return <>
        {contextHolder}
        <Layout className="layout-default">
            <Header className="header">

                <div
                    className="header__logo"
                    onClick={() => navigate("/")}
                >
                    <img alt="logo" src={logo} />
                </div>

                <div className="header__content" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="header__content__top">
                        <div className="header__content__top__network">

                            <div className="header__content__top__network__tiktok">
                                <TikTokOutlined /> Tiktok
                            </div>
                            <div className="header__content__top__network__facebook">
                                <FacebookOutlined />   Facebook
                            </div>
                            <div className="header__content__top__network__youtube">
                                <YoutubeOutlined />  Youtube
                            </div>

                        </div>
                        <div className="header__content__top__wrapper">

                            {isMobile ? (
                                <Dropdown overlay={dropdownMenu} trigger={['click']} placement="bottomRight">
                                    <Button type="default" icon={<MenuOutlined />}>
                                        Menu
                                    </Button>
                                </Dropdown>
                            ) : (
                                <>
                                    <div className="header__content__top__wrapper__chat-button">
                                        <Button
                                            type="primary"
                                            icon={<MessageOutlined />}
                                            onClick={() => navigate('/chat')}
                                        >
                                            Trò chuyện với DABS Bot
                                        </Button>
                                    </div>
                                    <div className="header__content__top__wrapper__account">
                                        {user ? (
                                            <Dropdown overlay={accountMenu} placement="bottomRight" trigger={['click']}>
                                                <Button type="primary" icon={<UserOutlined />}>
                                                    {user.fullname?.trim() || user.email}
                                                </Button>
                                            </Dropdown>
                                        ) : (
                                            <Button onClick={() => navigate('/login')} type="primary">
                                                <UserOutlined /> Đăng nhập
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}

                        </div>

                    </div>


                </div>

            </Header>
            <div className="nav-sticky-wrapper">
                <div className="header__content__bottom">
                    <Menu
                        mode="horizontal"
                        overflowedIndicator={<MenuOutlined />}
                    >
                        <Menu.Item key="homepage" onClick={() => navigate('/')}>
                            Trang chủ
                        </Menu.Item>
                        {/* Support */}
                        <Menu.Item key="support" onClick={() => navigate('/about-us')}>
                            Giới thiệu
                        </Menu.Item>

                        {/* Cơ sở y tế (HospitalList, HospitalDetail) */}
                        <SubMenu
                            key="medical-facilities"
                            title={
                                <span>
                                    Cơ sở y tế <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="hospital-list" onClick={() => navigate('/hospital-list')}>
                                Danh sách cơ sở
                            </Menu.Item>
                            {/* Có thể thêm cơ sở cụ thể (không có route cố định) */}
                        </SubMenu>

                        {/* Dịch vụ y tế (AppointmentService, AppointmentSchedule, AppointmentDoctor, AppointmentSpecialty) */}
                        {/* <SubMenu
                            key="medical-services"
                            title={
                                <span>
                                    Dịch vụ y tế <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="appointment-service" onClick={() => navigate('/appointment')}>
                                Dịch vụ khám bệnh
                            </Menu.Item>
                            <Menu.Item key="appointment-schedule" onClick={() => navigate('/appointment/schedule')}>
                                Lịch khám
                            </Menu.Item>
                            <Menu.Item key="appointment-doctor" onClick={() => navigate('/appointment/doctor')}>
                                Bác sĩ
                            </Menu.Item>
                            <Menu.Item key="appointment-specialty" onClick={() => navigate('/appointment/specialty')}>
                                Chuyên khoa
                            </Menu.Item>
                        </SubMenu> */}

                        {/* Hồ sơ bệnh nhân (PatientRecords) */}
                        <Menu.Item key="patient-records" onClick={() => navigate('/profile')}>
                            Hồ sơ bệnh nhân
                        </Menu.Item>

                        {/* <Menu.Item key="enterprise-health" onClick={() => window.open('/', '_blank')}>
                            Khám sức khoẻ doanh nghiệp
                        </Menu.Item> */}

                        {/* Tin tức (nếu có trang tin tức, tạm giữ submenu) */}
                        {/* <SubMenu
                            key="news"
                            title={
                                <span>
                                    Tin tức <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="news-1" onClick={() => window.open('/', '_blank')}>Tin 1</Menu.Item>
                            <Menu.Item key="news-2" onClick={() => window.open('/', '_blank')}>Tin 2</Menu.Item>
                        </SubMenu> */}

                        {/* Hướng dẫn (UserGuide) */}
                        <SubMenu
                            key="guide"
                            title={
                                <span>
                                    Hướng dẫn <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="user-guide" onClick={() => navigate('/user-guide')}>
                                Hướng dẫn sử dụng
                            </Menu.Item>
                            {/* Nếu có thêm các hướng dẫn chi tiết khác */}
                        </SubMenu>

                        <SubMenu
                            key="contact"
                            title={
                                <span>
                                    Liên hệ hợp tác <CaretDownOutlined />
                                </span>
                            }
                        >
                            {/* <Menu.Item key="contact-1" onClick={() => window.open('/', '_blank')}>Liên hệ 1</Menu.Item>
                            <Menu.Item key="contact-2" onClick={() => window.open('/', '_blank')}>Liên hệ 2</Menu.Item> */}
                        </SubMenu>
                    </Menu>
                </div>
            </div>

            <main style={{ backgroundColor: "#e0f7fa", }}>

                <div className="layout-default-main">
                    <Outlet />
                </div>

            </main>
            <Footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>DABS Medical Booking</h4>
                        <p>Hỗ trợ đặt khám trực tuyến 24/7</p>
                        <p>© {new Date().getFullYear()} Created by G81</p>
                    </div>
                    <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <p><strong>Hotline:</strong> 1900 1234</p>
                        <p><strong>Email:</strong> contact@dabs.com.vn</p>
                        <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM</p>
                    </div>
                    <div className="footer-section">
                        <h4>Kết nối với chúng tôi</h4>
                        <div className="footer-social">
                            <a href="#"><FacebookOutlined /></a>
                            <a href="#"><YoutubeOutlined /></a>
                            <a href="#"><TikTokOutlined /></a>
                        </div>
                    </div>
                </div>
            </Footer>
        </Layout >
    </>
}

export default LayoutCommon;