import React, { useEffect, useState } from "react";
import { Button, Card, Col, Empty, Input, List, Pagination, Rate, Row, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { getHospitalList, getHospitalWorkDate } from "../../../services/hospitalService";
import imgErrorHospital from "../../../assets/images/errorImgHospital.jpg";

function HospitalList() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState([]);
  const [originalHospitalList, setOriginalHospitalList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedData = hospital.slice(startIdx, endIdx);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [workDate, setWorkDate] = useState(null);
  const [loadingWorkDate, setLoadingWorkDate] = useState(false);
  // const { Text, Title } = Typography;
  // const formatTime = (timeStr) => {
  //   if (!timeStr) return "";
  //   const [hours, minutes] = timeStr.split(':');
  //   return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  // };

  useEffect(() => {
    const fetchApi = async () => {
      const result = await getHospitalList();
      if (result) {
        setHospital(result);
        setOriginalHospitalList(result);
        setSelectedHospital(result[0] || null);
      } else {
        console.error("No hospital data found");
      }
    };
    fetchApi();
  }, []);

  // useEffect(() => {
  //   if (!selectedHospital) {
  //     setWorkDate(null);
  //     return;
  //   }
  //   const fetchWorkDate = async () => {
  //     setLoadingWorkDate(true);
  //     try {
  //       const result = await getHospitalWorkDate(selectedHospital.id);
  //       setWorkDate(result);
  //     } catch (error) {
  //       console.error("Lấy lịch làm việc thất bại", error);
  //       setWorkDate(null);
  //     }
  //     setLoadingWorkDate(false);
  //   };
  //   fetchWorkDate();
  // }, [selectedHospital]);

  // // Sắp xếp lịch làm việc thứ tự Thứ 2 -> Chủ nhật
  // const sortedWorkingDates = (workDate?.workingDates || []).slice().sort((a, b) => {
  //   const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
  //   const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
  //   return dayA - dayB;
  // });

  const onChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setHospital(originalHospitalList);
      return;
    }
    const filtered = originalHospitalList.filter((hospital) =>
      (hospital.name || "").toLowerCase().includes(value.toLowerCase())
    );
    setHospital(filtered);
    setCurrentPage(1);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#e0f7fa", // Đồng bộ với màu nền main
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px 36px",
          maxWidth: 640,
          margin: "0 auto 40px",
        }}
      >
        <h1
          style={{
            color: "#1a73e8",
            fontSize: "42px",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Danh sách cơ sở y tế
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#666",
            lineHeight: 1.6,
          }}
        >
          Lựa chọn bệnh viện hàng đầu để có trải nghiệm chăm sóc sức khỏe tốt nhất
        </p>
        <Input.Search
          placeholder="Tìm kiếm tên bệnh viện..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={onChange}
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 10,
            boxShadow: "0 4px 15px rgba(26,115,232,0.15)",
            marginTop: 16,
          }}
        />
      </div>

      <Row gutter={[28, 28]} justify="center">
        <Col xs={24} md={14}>
          {pagedData.length > 0 ? (
            pagedData.map((item, idx) => (
              <Card
                key={idx}
                onClick={() => setSelectedHospital(item)}
                hoverable
                style={{
                  marginBottom: 28,
                  borderRadius: 14,
                  background: "#ffffff",
                  boxShadow:
                    selectedHospital?.id === item.id
                      ? "0 6px 18px rgba(26,115,232,0.3)"
                      : "0 3px 10px rgba(0,0,0,0.07)",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
                bodyStyle={{ padding: 20 }}
              >
                <Row gutter={20} align="middle" style={{ display: "flex", flexWrap: "nowrap" }}>
                  <Col flex="none">
                    <img
                      src={item.image || imgErrorHospital}
                      alt="Ảnh bệnh viện"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "3px solid #1a73e8",
                      }}
                    />
                  </Col>
                  <Col flex="1" style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#0b3954",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name} <CheckCircleFilled style={{ color: "#43a047", marginLeft: 6 }} />
                    </h3>
                    <p
                      style={{
                        color: "#555",
                        fontSize: 15,
                        margin: "6px 0 10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <EnvironmentOutlined style={{ color: "#1a73e8", marginRight: 6 }} />{" "}
                      {item.address || "Chưa cập nhật"}
                    </p>
                    <Rate disabled defaultValue={5} style={{ fontSize: 16 }} />
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        gap: 14,
                      }}
                    >
                      <Button
                        type="primary"
                        size="middle"
                        style={{ borderRadius: 8, padding: "0 20px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/appointment?hospitalId=${item.id}`);
                        }}
                      >
                        Đặt khám
                      </Button>
                      <Button
                        size="middle"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hospital-detail/${item.id}`);
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Empty description="Không có dữ liệu bệnh viện" style={{ margin: "60px 0" }} />
          )}

          {pagedData.length > 0 && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={hospital.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              style={{ marginTop: 36, textAlign: "center" }}
            />
          )}
        </Col>

        <Col xs={0} md={10}>
          {selectedHospital && (
            <Card
              style={{
                borderRadius: 14,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                background: "#ffffff",
                padding: 28,
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <img
                  src={selectedHospital.image || imgErrorHospital}
                  alt="Logo"
                  style={{ height: 90, borderRadius: 12, objectFit: "cover" }}
                />
                <h2
                  style={{
                    color: "#1a73e8",
                    marginTop: 16,
                    fontWeight: "bold",
                    fontSize: 26,
                  }}
                >
                  {selectedHospital.name}
                </h2>
              </div>
              <p
                style={{
                  color: "#4a4a4a",
                  marginBottom: 24,
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                {selectedHospital.description || "Chưa có mô tả chi tiết"}
              </p>
              {/* <h3
                style={{
                  fontWeight: 600,
                  color: "#004876",
                  marginBottom: 8,
                  fontSize: 20,
                }}
              >
                Lịch làm việc
              </h3>

              {loadingWorkDate ? (
                <Spin tip="Đang tải lịch làm việc..." />
              ) : workDate?.workingDates?.length > 0 ? (
                <List
                  size="small"
                  style={{ maxHeight: 280, overflowY: "auto", marginBottom: 24 }}
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
                      {!item.isClosed && <CheckCircleFilled style={{ color: "#52c41a" }} />}
                    </List.Item>
                  )}
                />
              ) : (
                <Text>Chưa có lịch làm việc</Text>
              )} */}

              <h3
                style={{
                  fontWeight: 600,
                  color: "#004876",
                  marginBottom: 8,
                  fontSize: 20,
                }}
              >
                Bản đồ
              </h3>
              <iframe
                src={selectedHospital.googleMapUri}
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: 10 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ bệnh viện"
              ></iframe>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default HospitalList;
