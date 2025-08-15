import axios from 'axios';
import { getAuth, postAuth } from '../utils/request';

// Get patient appointments
export const getPatientAppointments = async (userId) => {
  try {
    console.log(`🔄 Fetching appointments for user ${userId}`);
    const result = await getAuth(`/user/${userId}/appointments`);
    console.log(`✅ Fetched appointments:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching appointments for user ${userId}:`, error);
    throw error;
  }
};

// Get available hospitals for patient
export const getHospitalsForPatient = async () => {
  try {
    console.log(`🔄 Fetching hospitals for patient`);
    const result = await getAuth('/hospitals');
    console.log(`✅ Fetched hospitals:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching hospitals:`, error);
    throw error;
  }
};

// Get doctors by hospital  
export const getDoctorsByHospital = async (hospitalId) => {
  try {
    console.log(`🔄 Fetching doctors for hospital ${hospitalId}`);
    const result = await getAuth(`/hospitals/${hospitalId}/doctors`);
    console.log(`✅ Fetched doctors:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching doctors for hospital ${hospitalId}:`, error);
    throw error;
  }
};

// Submit rating
export const submitRating = async (ratingData) => {
  try {
    console.log(`🔄 Submitting rating:`, ratingData);
    const result = await postAuth('/ratings', ratingData);
    console.log(`✅ Rating submitted:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error submitting rating:`, error);
    throw error;
  }
};