import React, { useState, useEffect } from 'react';
import {
    Result,
    Card,
    Descriptions,
    Button,
    Space,
    Tag,
    Typography,
    Divider,
    Row,
    Col,
    Timeline,
    Alert,
    Spin
} from 'antd';
import {
    CheckCircleOutlined,
    HomeOutlined,
    PrinterOutlined,
    DownloadOutlined,
    CalendarOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './PaymentSuccess.scss';
import { getPaymentByOrderId } from '../../services/paymentService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// ✅ Set Vietnamese locale
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;

const PaymentSuccess = () => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');

    // ✅ Vietnamese date formatting
    const formatDateTime = (dateString) => {
        if (!dateString) return dayjs().format('HH:mm:ss DD/MM/YYYY');

        try {
            const date = dayjs(dateString);
            return date.format('HH:mm:ss DD/MM/YYYY');
        } catch (error) {
            console.error('❌ Lỗi định dạng ngày:', error);
            return dayjs().format('HH:mm:ss DD/MM/YYYY');
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return dayjs().format('HH:mm:ss');

        try {
            const date = dayjs(dateString);
            return date.format('HH:mm:ss');
        } catch (error) {
            console.error('❌ Lỗi định dạng giờ:', error);
            return dayjs().format('HH:mm:ss');
        }
    };

    // ✅ Vietnamese amount formatting
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // ✅ Payment status mapping
    const getPaymentStatusInfo = (status) => {
        const statusMap = {
            'PAID': {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: 'ĐÃ THANH TOÁN',
                description: 'Thanh toán thành công'
            },
            'PENDING': {
                color: 'processing',
                icon: <ClockCircleOutlined />,
                text: 'ĐANG XỬ LÝ',
                description: 'Đang chờ thanh toán'
            },
            'CANCELLED': {
                color: 'error',
                icon: <CloseCircleOutlined />,
                text: 'ĐÃ HỦY',
                description: 'Giao dịch đã bị hủy'
            },
            'FAILED': {
                color: 'error',
                icon: <ExclamationCircleOutlined />,
                text: 'THẤT BẠI',
                description: 'Thanh toán thất bại'
            }
        };

        return statusMap[status] || {
            color: 'default',
            icon: <ExclamationCircleOutlined />,
            text: status || 'KHÔNG XÁC ĐỊNH',
            description: 'Trạng thái không xác định'
        };
    };

    useEffect(() => {
        if (orderId) {
            fetchPaymentData();
        } else {
            setError('Không tìm thấy mã đơn hàng');
            setLoading(false);
        }
    }, [orderId]);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Đang tải dữ liệu thanh toán cho đơn hàng:', orderId);

            const response = await getPaymentByOrderId(orderId);
            console.log('📥 Phản hồi dữ liệu thanh toán:', response);

            if (response?.success && response?.result) {
                setPaymentData(response.result);
                setError(null);
                console.log('✅ Đã tải thành công dữ liệu thanh toán');
            } else {
                throw new Error(response?.message || 'Không thể tải thông tin thanh toán');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu thanh toán:', error);
            setError('Không thể tải thông tin thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewAppointments = () => {
        navigate('/booking-history');
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleDownloadReceipt = () => {
        console.log('📄 Đang tải xuống hóa đơn...');
        // TODO: Implement download receipt functionality
    };

    // ✅ Loading state
    if (loading) {
        return (
            <div className="payment-loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <Spin size="large" tip="Đang tải thông tin thanh toán..." />
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className="payment-error">
                <Result
                    status="error"
                    title="Lỗi Tải Thông Tin Thanh Toán"
                    subTitle={error}
                    extra={
                        <Space>
                            <Button type="primary" onClick={handleGoHome}>
                                Về Trang Chủ
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Thử Lại
                            </Button>
                        </Space>
                    }
                />
            </div>
        );
    }

    // ✅ Get payment status info
    const statusInfo = getPaymentStatusInfo(paymentData?.status);
    const isPaymentSuccessful = paymentData?.status === 'PAID';
    const isCancelled = paymentData?.status === 'CANCELLED';

    return (
        <div className="payment-success-container">
            <div className="payment-success-content">
                {/* ✅ Dynamic Result based on payment status */}
                <Result
                    status={isPaymentSuccessful ? "success" : isCancelled ? "error" : "warning"}
                    title={
                        isPaymentSuccessful
                            ? "Thanh Toán Thành Công!"
                            : isCancelled
                                ? "Thanh Toán Đã Bị Hủy"
                                : "Trạng Thái Thanh Toán"
                    }
                    subTitle={
                        <div>
                            <Paragraph>
                                {isPaymentSuccessful
                                    ? "Thanh toán của bạn đã được xử lý thành công. Cuộc hẹn của bạn đã được xác nhận."
                                    : isCancelled
                                        ? "Giao dịch thanh toán đã bị hủy. Vui lòng thực hiện lại giao dịch nếu cần."
                                        : `Trạng thái thanh toán: ${statusInfo.description}`
                                }
                            </Paragraph>
                            <Text type="secondary">
                                Mã đơn hàng: <Text code>{paymentData?.orderCode || orderId}</Text>
                            </Text>
                            <br />
                            <Text type="secondary">
                                Mã giao dịch: <Text code>{paymentData?.id}</Text>
                            </Text>
                        </div>
                    }
                    icon={statusInfo.icon}
                />

                {/* ✅ Status Alert */}
                <Alert
                    message={statusInfo.text}
                    description={
                        isPaymentSuccessful
                            ? "Thanh toán đã được xử lý thành công và cuộc hẹn của bạn hiện đã được xác nhận. Bạn sẽ nhận được email xác nhận trong thời gian ngắn."
                            : isCancelled
                                ? `Giao dịch đã bị hủy ${paymentData?.canceledAt ? `vào ${formatDateTime(paymentData.canceledAt)}` : ''}. ${paymentData?.cancellationReason || 'Không có lý do hủy được cung cấp.'}`
                                : statusInfo.description
                    }
                    type={isPaymentSuccessful ? "success" : isCancelled ? "error" : "warning"}
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Row gutter={24}>
                    {/* ✅ Payment Details */}
                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <DollarOutlined style={{
                                        marginRight: 8,
                                        color: isPaymentSuccessful ? '#52c41a' : '#faad14'
                                    }} />
                                    Chi Tiết Thanh Toán
                                </div>
                            }
                            className="payment-details-card"
                        >
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Mã đơn hàng">
                                    <Text code>{paymentData?.orderCode}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã giao dịch">
                                    <Text code>{paymentData?.id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền">
                                    <Text strong style={{
                                        color: isPaymentSuccessful ? '#52c41a' : '#faad14',
                                        fontSize: '16px'
                                    }}>
                                        {formatAmount(paymentData?.amount)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền đã thanh toán">
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {formatAmount(paymentData?.amountPaid)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền còn lại">
                                    <Text strong style={{
                                        color: paymentData?.amountRemaining > 0 ? '#faad14' : '#52c41a'
                                    }}>
                                        {formatAmount(paymentData?.amountRemaining)} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Tag color="blue">PayOS</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={statusInfo.color} icon={statusInfo.icon}>
                                        {statusInfo.text}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    <Text>
                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                        {formatDateTime(paymentData?.createdAt)}
                                    </Text>
                                </Descriptions.Item>
                                {paymentData?.canceledAt && (
                                    <Descriptions.Item label="Ngày hủy">
                                        <Text style={{ color: '#ff4d4f' }}>
                                            <CloseCircleOutlined style={{ marginRight: 4 }} />
                                            {formatDateTime(paymentData.canceledAt)}
                                        </Text>
                                    </Descriptions.Item>
                                )}
                                {paymentData?.cancellationReason && (
                                    <Descriptions.Item label="Lý do hủy">
                                        <Text type="danger">{paymentData.cancellationReason}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* ✅ Transactions section */}
                            {paymentData?.transactions && paymentData.transactions.length > 0 && (
                                <>
                                    <Divider />
                                    <Title level={5}>
                                        <CalendarOutlined style={{ marginRight: 8 }} />
                                        Lịch Sử Giao Dịch
                                    </Title>
                                    {paymentData.transactions.map((transaction, index) => (
                                        <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                            <Descriptions column={2} size="small">
                                                <Descriptions.Item label="Mã giao dịch">
                                                    <Text code>{transaction.id || `TXN-${index + 1}`}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Số tiền">
                                                    <Text strong>{formatAmount(transaction.amount)} VND</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Trạng thái">
                                                    <Tag color="success">
                                                        Thành công
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Thời gian">
                                                    <Text>{formatDateTime(transaction.createdAt)}</Text>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    ))}
                                </>
                            )}

                            <Divider />


                        </Card>
                    </Col>

                    {/* ✅ Timeline & Actions */}
                    <Col xs={24} lg={10}>
                        {/* ✅ Process Timeline */}
                        <Card
                            title="Tiến Trình Xử Lý"
                            style={{ marginBottom: 16 }}
                            size="small"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: 'green',
                                        children: (
                                            <div>
                                                <Text strong>Khởi tạo thanh toán</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {formatTime(
                                                        paymentData?.createdAt
                                                            ? dayjs(paymentData.createdAt).subtract(2, 'minute').toISOString()
                                                            : dayjs().subtract(2, 'minute').toISOString()
                                                    )}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: paymentData?.status === 'PAID' ? 'green' : paymentData?.status === 'CANCELLED' ? 'red' : 'orange',
                                        children: (
                                            <div>
                                                <Text strong>
                                                    {paymentData?.status === 'PAID'
                                                        ? 'Thanh toán thành công'
                                                        : paymentData?.status === 'CANCELLED'
                                                            ? 'Thanh toán bị hủy'
                                                            : 'Xử lý thanh toán'
                                                    }
                                                </Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {formatTime(
                                                        paymentData?.canceledAt || paymentData?.createdAt || dayjs().toISOString()
                                                    )}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    ...(isPaymentSuccessful ? [
                                        {
                                            color: 'green',
                                            children: (
                                                <div>
                                                    <Text strong>Xác nhận cuộc hẹn</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {formatTime(paymentData?.createdAt)}
                                                    </Text>
                                                </div>
                                            ),
                                        },

                                    ] : [])
                                ]}
                            />
                        </Card>

                        {/* ✅ Next Steps */}
                        <Card title="Bước Tiếp Theo" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {isPaymentSuccessful && (
                                    <Button
                                        type="primary"
                                        icon={<CalendarOutlined />}
                                        block
                                        onClick={handleViewAppointments}
                                    >
                                        Xem Cuộc Hẹn Của Tôi
                                    </Button>
                                )}

                                <Button
                                    icon={<PrinterOutlined />}
                                    block
                                    onClick={handlePrintReceipt}
                                >
                                    In Hóa Đơn
                                </Button>

                                <Button
                                    icon={<DownloadOutlined />}
                                    block
                                    onClick={handleDownloadReceipt}
                                >
                                    Tải Xuống Hóa Đơn
                                </Button>

                                {!isPaymentSuccessful && (
                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => window.location.href = '/booking'}
                                    >
                                        Đặt Lịch Lại
                                    </Button>
                                )}

                                <Divider style={{ margin: '12px 0' }} />

                                <Button
                                    icon={<HomeOutlined />}
                                    block
                                    onClick={handleGoHome}
                                >
                                    Về Trang Chủ
                                </Button>
                            </Space>
                        </Card>

                        {/* ✅ Support Information */}
                        <Alert
                            message="Cần Hỗ Trợ?"
                            description={
                                <div>
                                    <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                        Nếu bạn có bất kỳ câu hỏi nào về thanh toán hoặc cuộc hẹn của mình,
                                        vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                                    </Paragraph>
                                    <Text style={{ fontSize: '12px' }}>
                                        📞 Hotline: 1900-1234 | 📧 hotro@benhvien.com
                                    </Text>
                                </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PaymentSuccess;