import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, List, Avatar, Button, Spin, Typography, Skeleton } from 'antd';
import imgErrorHospital from "../../../assets/images/errorImgHospital.jpg";
import { CheckCircleFilled } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorByHospitalId } from '../../../services/doctorService';
import { getHospitalDetail, getHospitalWorkDate } from '../../../services/hospitalService';

const { Title, Text } = Typography;

function HospitalDetail() {
    const { hospitalId } = useParams();
    const [doctors, setDoctors] = useState([]);
    const [hospital, setHospital] = useState(null);
    const [loadingHospital, setLoadingHospital] = useState(true);
    const [workDate, setWorkDate] = useState([]);
    const navigate = useNavigate();

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const sortedWorkingDates = (workDate?.workingDates || []).slice().sort((a, b) => {

        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
        return dayA - dayB;
    });

    useEffect(() => {
        (async () => {
            const result = await getHospitalWorkDate(105);
            setWorkDate(result);
        })();
    }, [hospitalId]);

    console.log("work date is " + JSON.stringify(workDate));

    useEffect(() => {
        (async () => {
            setLoadingHospital(true);
            const result = await getHospitalDetail(hospitalId);
            setHospital(result);
            setLoadingHospital(false);
        })();
    }, [hospitalId]);

    useEffect(() => {
        (async () => {
            const result = await getDoctorByHospitalId(hospitalId);
            setDoctors(result);
        })();
    }, [hospitalId]);

    const columns = [
        { title: 'Dịch vụ', dataIndex: 'name', key: 'name' },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price?.toLocaleString('vi-VN') + ' VNĐ',
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', fontFamily: "'Poppins', sans-serif" }}>
            <Spin spinning={loadingHospital} tip="Đang tải thông tin...">
                {hospital ? (
                    <>
                        <Row gutter={[32, 32]} justify="space-between">
                            <Col xs={24} md={16}>
                                <Card
                                    style={{
                                        borderRadius: 16,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        marginBottom: 32,
                                        backgroundColor: '#ffffff',
                                    }}
                                    bodyStyle={{ padding: 24 }}
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                                            {hospital.image ? (
                                                <img
                                                    src={hospital.image}
                                                    alt="Logo bệnh viện"
                                                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 8px rgba(0,0,0,0.15)' }}
                                                />
                                            ) : null}
                                            <Title level={3} style={{ margin: 0, color: '#1890ff', userSelect: 'none' }}>
                                                {hospital.name || "Chưa có thông tin"}
                                            </Title>
                                        </div>
                                    }
                                >
                                    <Text strong>Địa chỉ: </Text><Text>{hospital.address || "Chưa có thông tin"}</Text><br />
                                    <Text strong>Giờ mở cửa: </Text><Text>{hospital.openTime ? new Date(hospital.openTime).toLocaleTimeString() : "Chưa có"}</Text><br />
                                    <Text strong>Giờ đóng cửa: </Text><Text>{hospital.closeTime ? new Date(hospital.closeTime).toLocaleTimeString() : "Chưa có"}</Text><br />
                                    <Text strong>Email: </Text><Text>{hospital.email || "Chưa có thông tin"}</Text><br />
                                    <Text strong>Số điện thoại: </Text><Text>{hospital.phoneNumber || "Chưa có thông tin"}</Text>

                                    <div style={{ textAlign: 'center', marginTop: 28 }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            shape="round"
                                            style={{
                                                padding: '10px 32px',
                                                fontSize: 18,
                                                boxShadow: '0 4px 10px rgba(24, 144, 255, 0.4)',
                                                transition: 'all 0.3s ease',
                                            }}
                                            onClick={() => navigate(`/appointment?hospitalId=${hospital.id}`)}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 14px rgba(24, 144, 255, 0.6)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 10px rgba(24, 144, 255, 0.4)'}
                                        >
                                            Đặt khám ngay
                                        </Button>
                                    </div>
                                </Card>

                                <Card
                                    title={<Title level={4} style={{ marginBottom: 16, userSelect: 'none' }}>Lịch làm việc</Title>}
                                    style={{ borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: 32 }}
                                    bodyStyle={{ padding: 16, maxHeight: 300, overflowY: 'auto' }}
                                    bordered={false}
                                >
                                    {workDate?.workingDates?.length > 0 ? (
                                        <List
                                            dataSource={sortedWorkingDates}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={<Text strong>{item.dayOfWeekName}</Text>}
                                                        description={
                                                            item.isClosed ? (
                                                                <Text type="danger">Đóng cửa</Text>
                                                            ) : (
                                                                <Text>
                                                                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                </Text>
                                                            )
                                                        }
                                                    />
                                                    {!item.isClosed && <CheckCircleFilled style={{ color: '#52c41a' }} />}
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Text>Chưa có lịch làm việc</Text>
                                    )}
                                </Card>

                                <Card
                                    title={<Title level={4} style={{ marginBottom: 16, userSelect: 'none' }}>Bảng giá dịch vụ</Title>}
                                    style={{ borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                    bodyStyle={{ padding: 16, maxHeight: 300, overflowY: 'auto' }}
                                    bordered={false}
                                    size="middle"
                                >
                                    <Table
                                        columns={columns}
                                        dataSource={hospital.services?.map((s) => ({ ...s, key: s.id })) || []}
                                        pagination={false}
                                        scroll={{ y: 280 }}
                                        rowKey="key"
                                        style={{ userSelect: 'none' }}
                                        locale={{ emptyText: 'Chưa có dịch vụ' }}
                                    />
                                </Card>


                            </Col>

                            <Col xs={24} md={7}>
                                <Card
                                    title={<Title level={4} style={{ margin: 0, userSelect: 'none' }}>Danh sách bác sĩ</Title>}
                                    style={{ borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: 28 }}
                                    bodyStyle={{ padding: '12px 16px', maxHeight: 250, overflowY: 'auto' }}
                                >
                                    {doctors.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={doctors}
                                            renderItem={(item) => (
                                                <List.Item
                                                    style={{ padding: '8px 0', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/doctor-detail/${item.id}`)}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={item.user.avatarUrl || imgErrorHospital} size="large" />}
                                                        title={<Text strong>{item.user.fullname}</Text>}
                                                        description={<Text type="secondary" style={{ fontSize: 14 }}>{item.description}</Text>}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Skeleton active paragraph={{ rows: 3 }} />
                                    )}
                                </Card>

                                <Card
                                    title={<Title level={4} style={{ margin: 0, userSelect: 'none' }}>Vị trí trên bản đồ</Title>}
                                    style={{ borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'sticky', top: 20, zIndex: 10 }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <iframe
                                        title="Google Map"
                                        width="100%"
                                        height="320"
                                        frameBorder="0"
                                        style={{ borderRadius: 16, border: 0 }}
                                        src={hospital?.googleMapUri || ""}
                                        allowFullScreen=""
                                        aria-hidden="false"
                                        tabIndex={0}
                                        loading="lazy"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 18px rgba(0,0,0,0.12)' }}>
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                )}
            </Spin>
        </div>
    );
}

export default HospitalDetail;
