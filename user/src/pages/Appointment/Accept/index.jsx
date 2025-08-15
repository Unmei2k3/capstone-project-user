import { Button, ConfigProvider, Menu, message } from "antd";
import viVN from "antd/locale/vi_VN";
import {
    CalendarOutlined,
    CheckCircleFilled,
    UserOutlined,
    DollarOutlined,
    SolutionOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import "./styles.scss";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getHospitalDetail } from "../../../services/hospitalService";
import { createBookAppointment } from "../../../services/appointmentService";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import { getAllPayment } from "../../../services/paymentService";
dayjs.locale("vi");


function AppointmentReviewPage() {
    const user = useSelector((state) => state.user.user);
    console.log("user in accept payment : " + JSON.stringify(user));
    const [hospital, setHospital] = useState();
    const [payment, setPayment] = useState();
    const [latestPayment, setLatestPayment] = useState(null);
    const location = useLocation();
    const { stepData } = location.state || {};
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    console.log("meta in accept : " + JSON.stringify(stepData));

    useEffect(() => {
        const fetchApi = async () => {
            const result = await getHospitalDetail(stepData?.hospitalId);
            setHospital(result);
        };
        fetchApi();
    }, [stepData?.hospitalId]);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const hospitalId = Number(stepData.hospitalId);
                const userId = user.id;
                console.log("Legend Here hospitalId: " + hospitalId + " userId: " + userId);

                const response = await getAllPayment(hospitalId, userId);

                // ✅ Check if response has result array
                if (response && response.result && Array.isArray(response.result)) {
                    // ✅ Sort by createdOn (newest first) and get the latest
                    const sortedPayments = response.result.sort((a, b) =>
                        new Date(b.createdOn) - new Date(a.createdOn)
                    );

                    const latestPayment = sortedPayments[0]; // Get the newest one
                    const allPayments = sortedPayments; // All payments sorted
                    setLatestPayment(latestPayment);
                    console.log("📥 All payments fetched:", allPayments);
                    console.log("🆕 Latest payment:", latestPayment);

                    setPayment(allPayments); // Set all payments



                } else {
                    console.log("⚠️ No payments found or invalid response format");
                    setPayment([]);
                }

            } catch (error) {
                console.error('❌ Error fetching payments:', error);
                setPayment([]);
            }
        };

        if (stepData?.hospitalId && user?.id) {
            fetchPayment();
        }
    }, [stepData?.hospitalId, user?.id, dispatch]);

    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,

            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);

    const items = [
        {
            key: "center",
            label: <span style={{ fontWeight: 600 }}>{stepData?.hospitalName || "Không rõ"}</span>,
        },
        {
            key: "review",
            label: (
                <span style={{ color: "#00bfff", fontWeight: 600 }}>
                    Xác nhận thông tin khám
                </span>
            ),
        },
    ];

    const iconStyle = {
        color: "#00bfff",
        marginRight: 8,
        fontSize: 18,
    };

    const handleBackToPayment = () => {
        navigate("/appointment/booking" +
            `?hospitalId=${stepData?.hospitalId}&serviceId=${stepData?.serviceId}&serviceName=${stepData?.serviceName}&hospitalName=${stepData?.hospitalName}`,
            { state: { stepData: stepData, backToStepIndex: stepData.backToStepIndex ?? 0 } }
        );
    };

    const handleConfirmBooking = async () => {
        const requiredFields = [
            user.fullname,
            user.dob,
            user.phoneNumber,
            user.gender !== null && user.gender !== undefined,
            user.cccd,
            user.province,
            user.ward,
            user.streetAddress
        ];

        const isProfileComplete = requiredFields.every(field => !!field);

        if (!isProfileComplete) {
            dispatch(setMessage({
                type: 'error',
                content: 'Vui lòng hoàn thiện hồ sơ trước khi đặt khám.'
            }));
            return;
        }

        try {
            // ✅ Tạo payload không phụ thuộc vào response
            const payload = {
                hospitalId: Number(stepData.hospitalId),
                serviceId: Number(stepData.serviceId),
                returnUrl: `http://localhost:3000/payment/success`,
                cancelUrl: `http://localhost:3000/payment/cancelled`,
                appointmentDate: stepData?.date,
                bookingTime: stepData.shift === "morning" ? 1 : 2,
                paymentMethod: stepData.paymentType === "cash" ? 1 : 2,
                note: "",
                ...(stepData.specialty?.id ? { specializationId: Number(stepData.specialty.id) } : {}),
                ...(stepData.doctor?.id ? { doctorId: Number(stepData.doctor.id) } : {})
            };

            console.log("📤 Payload to send:", JSON.stringify(payload));

            // ✅ Gọi API booking
            const bookingResponse = await createBookAppointment(payload);
            console.log("✅ Booking response:", bookingResponse);

            // ✅ Kiểm tra response structure


            const { result } = bookingResponse;
            console.log("📋 Booking result:", result);

            // ✅ Hiển thị thông báo thành công
            dispatch(setMessage({
                type: 'success',
                content: 'Đặt khám thành công!'
            }));

            // ✅ Xử lý theo phương thức thanh toán - CHỈ dựa vào bookingResponse
            if (stepData.paymentType === 'online') {
                console.log("💳 Online payment selected");

                // Chỉ sử dụng dữ liệu từ bookingResponse
                if (result.checkoutUrl) {
                    console.log("🔗 Redirecting to checkout URL:", result.checkoutUrl);
                    window.location.href = result.checkoutUrl;
                } else if (result.paymentUrl) {
                    console.log("🔗 Redirecting to payment URL:", result.paymentUrl);
                    window.location.href = result.paymentUrl;
                } else if (result.payOsId) {
                    console.log("🔗 Redirecting to PayOS:", result.payOsId);
                    window.location.href = `https://pay.payos.vn/web/${result.payOsId}/`;
                } else {
                    console.error("❌ No payment URL found in response");
                    console.log("🔍 Available fields:", Object.keys(result));
                    dispatch(setMessage({
                        type: 'error',
                        content: 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.'
                    }));
                }
            } else {
                // Thanh toán tiền mặt
                console.log("💰 Cash payment selected");
                dispatch(setMessage({
                    type: 'success',
                    content: 'Đặt khám thành công! Vui lòng thanh toán tại cơ sở y tế.'
                }));

                // Redirect về trang booking history
                setTimeout(() => {
                    navigate('/booking-history');
                }, 2000);
            }

        } catch (error) {
            console.error("❌ Booking error:", error);

            // Xử lý các loại lỗi khác nhau
            let errorMessage = 'Có lỗi xảy ra khi đặt lịch khám.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            dispatch(setMessage({
                type: 'error',
                content: "Bạn đã đặt lịch này rồi hoặc ca làm việc của bác sĩ không khả dụng!"
            }));
        }
    };
    return (
        <>
            {contextHolder}
            <div style={{ background: "#eaf8ff", display: "flex", flexDirection: "column" }}>
                <Menu
                    mode="horizontal"
                    selectedKeys={["review"]}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 16,
                        boxShadow: "none",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 50,
                    }}
                    items={items}
                    disabledOverflow
                />

                <ConfigProvider locale={viVN}>
                    <div
                        className="responsive-container"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            marginBottom: 50,
                            gap: 32,
                            padding: 40,
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                boxShadow: "0 2px 8px #e6f4ff",
                                width: 340,
                                minWidth: 300,
                                paddingBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    background: "linear-gradient(90deg, #00bfff 60%, #00eaff 100%)",
                                    color: "#fff",
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    fontWeight: 600,
                                    fontSize: 18,
                                    padding: "16px 24px",
                                }}
                            >
                                Thông tin cơ sở y tế
                            </div>

                            <div style={{ padding: "24px 24px 0 24px", fontSize: 15 }}>
                                <div style={{ fontSize: 15 }}>

                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                        <CheckCircleFilled style={{ color: "#00bfff", marginRight: 8 }} />
                                        {hospital?.name || "Không rõ"}
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <EnvironmentOutlined style={{ color: "#00bfff", marginRight: 8 }} />
                                        <span style={{ fontWeight: 500 }}>Địa chỉ:</span> {hospital?.address || "Không rõ"}
                                    </div>


                                </div>

                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 50 }}>
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: 16,
                                    boxShadow: "0 2px 8px #e6f4ff",
                                    width: "auto",
                                    paddingBottom: 24,
                                    minWidth: 600,
                                }}
                            >
                                <div
                                    style={{
                                        background: "linear-gradient(90deg, #00bfff 60%, #00eaff 100%)",
                                        color: "#fff",
                                        borderTopLeftRadius: 16,
                                        borderTopRightRadius: 16,
                                        fontWeight: 600,
                                        fontSize: 20,
                                        padding: "16px 24px",
                                        marginBottom: 0,
                                    }}
                                >
                                    Xác nhận thông tin khám
                                </div>

                                <div style={{ padding: "24px" }}>
                                    {[
                                        {
                                            icon: <SolutionOutlined style={iconStyle} />,
                                            label: "Dịch vụ",
                                            value: stepData?.serviceName || "Không rõ",
                                        },
                                        stepData?.specialty && {
                                            icon: <TeamOutlined style={iconStyle} />,
                                            label: "Chuyên khoa",
                                            value: stepData.specialty.name || "Không rõ",
                                        },
                                        stepData?.doctor && {
                                            icon: <UserOutlined style={iconStyle} />,
                                            label: "Bác sĩ",
                                            value: stepData.doctor?.user?.fullname || "Không rõ",
                                        },
                                        {
                                            icon: <CalendarOutlined style={iconStyle} />,
                                            label: "Ngày khám",
                                            value: (
                                                <>
                                                    {stepData?.date
                                                        ? dayjs(stepData.date).format("DD/MM/YYYY")
                                                        : "Không rõ"} (
                                                    <span style={{ fontWeight: 500 }}>
                                                        {stepData?.shift === "morning" ? "Buổi sáng" : "Buổi chiều"}
                                                    </span>
                                                    )
                                                </>
                                            ),
                                        },
                                        {
                                            icon: <DollarOutlined style={iconStyle} />,
                                            label: "Thanh toán",
                                            value:
                                                stepData?.paymentType === 'cash'
                                                    ? 'Tiền mặt tại cơ sở'
                                                    : stepData?.paymentType === 'online'
                                                        ? 'Thanh toán online'
                                                        : 'Chưa chọn',
                                        },
                                    ]
                                        .filter(Boolean)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: 8,
                                                    fontSize: 16,
                                                }}
                                            >
                                                {item.icon}
                                                <span style={{ fontWeight: 500, marginRight: 4 }}>{item.label}:</span>
                                                <span>{item.value}</span>
                                            </div>
                                        ))}
                                </div>

                                <div
                                    style={{
                                        borderTop: "1px solid #eee",
                                        margin: "0 24px 16px",
                                    }}
                                />

                                <div style={{ padding: "0 24px" }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>
                                            <UserOutlined style={{ color: "#00bfff", marginRight: 8 }} />
                                            Thông tin cá nhân
                                        </span>
                                        <Button
                                            type="link"
                                            onClick={() => navigate("/profile")}
                                            icon={<EyeOutlined />}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </h4>
                                    <p><strong>Họ tên:</strong> {user?.fullname || "..."}</p>
                                    <p><strong>Email:</strong> {user?.email || "..."}</p>
                                    <p><strong>Số điện thoại:</strong> {user?.phoneNumber || "..."}</p>
                                    <p><strong>Mã định danh/CCCD:</strong> {user?.cccd || "..."}</p>
                                </div>

                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Button
                                    onClick={handleBackToPayment}
                                    style={{
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                        marginTop: 30
                                    }}
                                >
                                    ← Quay lại
                                </Button>

                                <Button
                                    type="primary"
                                    onClick={handleConfirmBooking}
                                    style={{
                                        borderRadius: 6,
                                        backgroundColor: "#00cfff",
                                        borderColor: "#00cfff",
                                        marginTop: 30
                                    }}
                                >
                                    Xác nhận đặt khám
                                </Button>
                            </div>
                        </div>
                    </div>
                </ConfigProvider>
            </div>
        </>
    );
}

export default AppointmentReviewPage;
