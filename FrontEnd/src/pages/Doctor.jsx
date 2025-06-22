import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Doctor = () => {
  const { speciality } = useParams()
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch specialties from API
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setSpecialtiesLoading(true)
        
        const response = await fetch("http://localhost:5000/api/home/get-all-specialties")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setSpecialties(data)
      } catch (error) {
        console.error("Failed to fetch specialties:", error)
        // Set default specialties as fallback
        setSpecialties([
          { description: 'General physician' },
          { description: 'Gynecologist' },
          { description: 'Dermatologist' },
          { description: 'Pediatricians' },
          { description: 'Neurologist' },
          { description: 'Gastroenterologist' }
        ])
      } finally {
        setSpecialtiesLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem("AToken")
        const response = await fetch(
          "http://localhost:5000/api/admin/get-all-doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDoctors(data)
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
        setError("Failed to load doctors. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Apply specialty filter
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.specialtyDescription === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  // Handle specialty click
  const handleSpecialtyClick = (specialtyName) => {
    if (speciality === specialtyName) {
      navigate('/doctors')
    } else {
      navigate(`/doctors/${specialtyName}`)
    }
  }

  // Loading state
  if (loading || specialtiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button 
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-blue-300 text-white' : ''}`} 
          onClick={() => setShowFilter(prev => !prev)}
        >
          Filters
        </button>
        
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {/* Add "All Specialties" option */}
          <p 
            onClick={() => navigate('/doctors')} 
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${!speciality ? "bg-indigo-100 text-black" : ""}`}
          >
            All Specialties
          </p>
          
          {/* Dynamic specialty filters */}
          {specialties.map((specialty, index) => (
            <p 
              key={index}
              onClick={() => handleSpecialtyClick(specialty.description)} 
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === specialty.description ? "bg-indigo-100 text-black" : ""}`}
            >
              {specialty.description}
            </p>
          ))}
        </div>
        
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              {speciality ? `No doctors found for ${speciality}` : 'No doctors available'}
            </div>
          ) : (
            filterDoc.map((item, index) => (
              <div 
                onClick={() => navigate(`/appointment/${item.doctorId}`)} 
                className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' 
                key={index}
              >
                <img 
                  className='bg-blue-50 w-full h-48 object-cover' 
                  src={`http://localhost:5000${item.imageUrl}`} 
                  alt={item.fullName}
                  onError={(e) => {
                    e.target.src = '/placeholder-doctor.jpg' // fallback image
                  }}
                />
                <div className='p-4'>
                  <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                    <p className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></p>
                    <p>{item.isAvailable ? 'Available' : 'Unavailable'}</p>
                  </div>
                  <p className='font-medium text-lg mt-2'>Dr.{item.fullName}</p>
                  <p className='text-gray-600'>{item.specialtyDescription}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-yellow-500'>★</span>
                    <span className='text-sm text-gray-600'>{item.rating.toFixed(1)}</span>
                    <span className='text-sm text-gray-500'>• {item.experienceYears} years exp.</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctor