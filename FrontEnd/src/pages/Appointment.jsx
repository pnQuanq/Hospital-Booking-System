import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Appointment = () => {
  const {docId} = useParams()
  const {doctors, currencySymbol} = useContext(AppContext)
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']

  const [docInfo,setDocInfo] = useState(null)
  const [docSlots,setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime,setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const newDocSlots = [];
    let dayOffset = 1;
    let weekdaysAdded = 0;

    // Get next 5 weekdays (Mon-Fri)
    while (weekdaysAdded < 7) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const timeSlots = [];
        
        // Morning slots (7:00 AM - 9:00 AM)
        let morningStart = new Date(currentDate);
        morningStart.setHours(7, 0, 0, 0);
        let morningEnd = new Date(currentDate);
        morningEnd.setHours(9, 0, 0, 0);

        // Afternoon slots (1:30 PM - 3:00 PM)
        let afternoonStart = new Date(currentDate);
        afternoonStart.setHours(13, 30, 0, 0);
        let afternoonEnd = new Date(currentDate);
        afternoonEnd.setHours(15, 0, 0, 0);

        // Generate morning slots
        let currentTime = new Date(morningStart);
        while (currentTime <= morningEnd) {
          timeSlots.push(createTimeSlot(currentTime));
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        // Generate afternoon slots
        currentTime = new Date(afternoonStart);
        while (currentTime <= afternoonEnd) {
          timeSlots.push(createTimeSlot(currentTime));
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        newDocSlots.push(timeSlots);
        weekdaysAdded++;
      }
      dayOffset++;
    }

    setDocSlots(newDocSlots);
  }

  const createTimeSlot = (date) => {
    return {
      datetime: new Date(date),
      time: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }).replace(/AM|PM/, match => match.toLowerCase())
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  return docInfo && (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-blue-600 w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon}></img></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.map((item, index) => (
            <div 
              key={index}
              onClick={() => { setSlotIndex(index); setSlotTime('') }}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-blue-600 text-white' : 'border border-gray-200'}`}
            >
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots[slotIndex]?.map((item, index) => (
            <p 
              key={index}
              onClick={() => setSlotTime(item.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                item.time === slotTime ? 'bg-blue-600 text-white' : 'text-gray-400 border border-gray-300'
              }`}
            >
              {item.time}
            </p>
          ))}
        </div>

        {slotTime && (
          <button className='bg-blue-600 text-white text-sm font-light px-14 py-3 rounded-full my-6'>
            Book appointment at {slotTime}
          </button>
        )}
      </div>
    </div>
  )
}

export default Appointment