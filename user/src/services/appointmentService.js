import { getAuth, postAuth, putAuth } from "../utils/request";

export const getStepByServiceId = async (serviceId) => {
  try {
    const result = await getAuth(`/services/${serviceId}/servicesteps`);
    console.log(`Steps for service ${serviceId}:`, result);

    if (!result || !Array.isArray(result)) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching steps for service ${serviceId}:`, error.message);
    throw error;
  }
};


export const createBookAppointment = async (payload) => {
  try {
    const result = await postAuth('/appointments/book', payload);
    if (!result) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching Appointment  ${payload}:`, error.message);
    throw error;
  }
};


export const getAppointmentByUserId = async (userId) => {
  try {
    console.log(`📞 Making API call: /user/${userId}/appointments`);
    const result = await getAuth(`/user/${userId}/appointments`);

    console.log(`📥 API Response:`, result);
    console.log(`📥 Response type:`, typeof result);

    // ✅ Check if response exists
    if (!result) {
      throw new Error("No response from server.");
    }

    // ✅ Handle the actual response structure from your backend
    let appointments;

    if (Array.isArray(result)) {
      // Direct array response
      appointments = result;
    } else if (result.result && Array.isArray(result.result)) {
      // Response with result property (your case)
      appointments = result.result;
    } else if (result.data && Array.isArray(result.data)) {
      // Response with data property
      appointments = result.data;
    } else {
      console.warn(`⚠️ Unexpected response structure:`, result);
      throw new Error("Invalid response structure. Expected array or object with result/data array.");
    }

    console.log(`✅ Extracted appointments:`, appointments.length, 'items');
    return appointments;

  } catch (error) {
    console.error(`❌ Error fetching appointments for userId ${userId}:`, error.message);
    throw error;
  }
}

export const getAppointmentDetail = async (appointmentId) => {
  try {
    const result = await getAuth(`/appointments/${appointmentId}`);
    if (!result) {
      throw new Error("Invalid response from server. Expected an object.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching Appointment detail for ${appointmentId}:`, error.message);
    throw error;

  }
}

export const cancelAppointment = async (appointmentId) => {
  try {
    const result = await putAuth(`/appointments/${appointmentId}/cancel`);
    return result;
  } catch (error) {
    console.error(`Error canceling Appointment ${appointmentId}:`, error.message);
    throw error;

  }
}

