import React from "react";
import { Row, Col, Card, Typography, Steps, Space, Divider } from "antd";
import {
    UserAddOutlined,
    LoginOutlined,
    UnlockOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    WalletOutlined,
    UserSwitchOutlined,
    RobotOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const UserGuide = () => {
    return (
        <div
            style={{
                maxWidth: 960,
                margin: "40px auto",
                padding: "24px",
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "transparent", 
                borderRadius: 12,
            }}
        >
    
            <Title
                level={2}
                style={{ textAlign: "center", color: "#1a73e8", marginBottom: 36 }}
            >
                Hướng dẫn sử dụng hệ thống DABS
            </Title>

            <Card
                bordered={false}
                style={{
                    marginBottom: 40,
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    padding: 24,
                }}
            >
                <Title level={4} style={{ color: "#004876", marginBottom: 24 }}>
                    Các bước đăng ký, đăng nhập và lấy lại mật khẩu
                </Title>
                <Steps
                    direction="vertical"
                    size="small"
                    current={-1}
                    style={{ maxWidth: 700 }}
                >
                    <Step
                        title={
                            <Text strong>
                                <UserAddOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                                Đăng ký tài khoản
                            </Text>
                        }
                        description={
                            <>
                                <Paragraph>
                                    Người dùng điền đầy đủ thông tin như email, mật khẩu, họ tên để tạo
                                    tài khoản cá nhân trong hệ thống.
                                </Paragraph>
                                <Paragraph>
                                    Mã xác nhận sẽ được gửi vào email hoặc số điện thoại để kích hoạt
                                    tài khoản.
                                </Paragraph>
                            </>
                        }
                    />
                    <Step
                        title={
                            <Text strong>
                                <LoginOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                                Đăng nhập hệ thống
                            </Text>
                        }
                        description={
                            <Paragraph>
                                Sử dụng email và mật khẩu đã đăng ký để đăng nhập vào hệ thống, bắt đầu
                                trải nghiệm dịch vụ.
                            </Paragraph>
                        }
                    />
                    <Step
                        title={
                            <Text strong>
                                <UnlockOutlined style={{ color: "#d48806", marginRight: 8 }} />
                                Quên mật khẩu
                            </Text>
                        }
                        description={
                            <Paragraph>
                                Nếu quên mật khẩu, người dùng có thể yêu cầu gửi link đặt lại mật khẩu
                                qua email đã đăng ký.
                            </Paragraph>
                        }
                    />
                </Steps>
            </Card>

            {/* Xem thông tin cơ sở y tế */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 40,
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 3px 10px rgba(26,115,232,0.1)",
                    padding: 24,
                }}
            >
                <Title level={4} style={{ color: "#004876", marginBottom: 24 }}>
                    Xem thông tin cơ sở y tế và chuyên khoa
                </Title>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ maxWidth: 700, color: "#333" }}
                >
                    <Text>
                        <TeamOutlined style={{ color: "#1890ff", marginRight: 8 }} /> Truy cập danh
                        sách bệnh viện, phòng khám trực tuyến.
                    </Text>
                    <Text>
                        <MedicineBoxOutlined style={{ color: "#52c41a", marginRight: 8 }} /> Xem
                        chi tiết từng bệnh viện gồm mô tả, hình ảnh, chuyên khoa, đánh giá người dùng.
                    </Text>
                    <Text>
                        <EnvironmentOutlined style={{ color: "#fa541c", marginRight: 8 }} /> Xem
                        vị trí bản đồ trực tiếp trong trang chi tiết cơ sở y tế.
                    </Text>
                </Space>
            </Card>

            {/* Đặt lịch khám từng bước */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 40,
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 3px 10px rgba(26,115,232,0.1)",
                    padding: 24,
                }}
            >
                <Title level={4} style={{ color: "#004876", marginBottom: 24 }}>
                    Đặt lịch khám theo từng bước
                </Title>
                <Steps
                    direction="vertical"
                    size="small"
                    current={-1}
                    style={{ maxWidth: 700 }}
                >
                    <Step
                        title={
                            <Text strong>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Chọn dịch vụ muốn khám.
                            </Text>
                        }
                        description={<Paragraph>Chọn dịch vụ theo ý muốn.</Paragraph>}
                    />
                    <Step
                        title={
                            <Text strong>
                                <TeamOutlined style={{ marginRight: 8 }} /> Chọn chuyên khoa phù hợp.
                            </Text>
                        }
                        description={
                            <>
                                <Paragraph>
                                    Chọn chuyên khoa và bác sĩ phù hợp với tình trạng sức khỏe của bạn.
                                </Paragraph>
                                <Paragraph style={{ color: "#d48806" }} type="warning">
                                    <strong>Lưu ý:</strong> Một số dịch vụ trực tiếp không yêu cầu chọn
                                    chuyên khoa hoặc bác sĩ. Bạn có thể bỏ qua bước này và tiếp tục đặt
                                    lịch, thanh toán.
                                </Paragraph>
                            </>
                        }
                    />
                    <Step
                        title={
                            <Text strong>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Chọn thời gian phù hợp.
                            </Text>
                        }
                        description={<Paragraph>Chọn khung giờ lịch khám theo ý muốn.</Paragraph>}
                    />
                    <Step
                        title={
                            <Text strong>
                                <WalletOutlined style={{ marginRight: 8 }} />
                                Chọn phương thức thanh toán và xác nhận lịch hẹn
                            </Text>
                        }
                        description={
                            <Paragraph>
                                Thanh toán có thể thực hiện trực tuyến hoặc tại cơ sở y tế.
                            </Paragraph>
                        }
                    />
                    <Step
                        title={
                            <Text strong>
                                <UserSwitchOutlined style={{ marginRight: 8 }} />
                                Cập nhật thông tin cá nhân trước khi đến khám
                            </Text>
                        }
                        description={
                            <Paragraph>
                                Đảm bảo thông tin hồ sơ bệnh nhân và liên hệ chính xác.
                            </Paragraph>
                        }
                    />
                </Steps>
            </Card>

            {/* Huỷ lịch hẹn */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 40,
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 3px 10px rgba(26,115,232,0.1)",
                    padding: 24,
                }}
            >
                <Title level={4} style={{ color: "#004876", marginBottom: 24 }}>
                    Huỷ lịch hẹn
                </Title>
                <Text>
                    Nếu muốn huỷ hoặc thay đổi lịch hẹn, người dùng truy cập mục lịch sử đặt
                    khám, chọn lịch hẹn cần huỷ và bấm nút huỷ. Lưu ý huỷ trước thời gian hẹn
                    để tránh mất phí.
                </Text>
            </Card>

            {/* Chatbot hỗ trợ */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 40,
                    borderRadius: 12,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 3px 10px rgba(26,115,232,0.1)",
                    padding: 24,
                }}
            >
                <Title level={4} style={{ color: "#004876", marginBottom: 24 }}>
                    Chatbot hỗ trợ đặt lịch (DABS Bot)
                </Title>
                <Text>
                    Sử dụng tính năng chat trực tiếp với DABS Bot để được hướng dẫn đặt lịch,
                    trả lời các câu hỏi thường gặp và hỗ trợ khẩn cấp. Nhấn vào nút “Trò chuyện
                    với DABS Bot” trên giao diện để bắt đầu.
                </Text>
            </Card>

            <Divider />

            <Text
                style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 12,
                    color: "#888",
                    fontSize: 14,
                }}
            >
                © {new Date().getFullYear()} DABS Medical Booking - Hỗ trợ sức khỏe thông minh
            </Text>
        </div>
    );
};

export default UserGuide;
