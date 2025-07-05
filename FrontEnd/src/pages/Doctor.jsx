import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Doctor = () => {
  const { speciality } = useParams()
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [filterDoc, setFilterDoc] = useState([])
  const [recommendedDoctors, setRecommendedDoctors] = useState([])
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recommendationStrategy, setRecommendationStrategy] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) 
  
  const navigate = useNavigate()

  // Get patient ID from localStorage or context (adjust based on your auth implementation)
  const getPatientId = () => {
    // This should be adjusted based on how you store patient information
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.patientId || userInfo.id || 1 // fallback to 1 for testing
  }

  // Fetch personalized recommendations
  const fetchPersonalizedRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      const token = localStorage.getItem("AToken")
      const patientId = getPatientId()
      
      const requestPayload = {
        patientId: patientId,
        topCount: 5,
        onlyAvailable: true,
        // Optional filters - can be added based on UI controls
        minRating: 4.0,
        // preferredSpecialtyId: speciality ? getSpecialtyId(speciality) : null
      }

      const response = await fetch(
        "http://localhost:5000/api/doctorrecommendation/recommendations",
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPersonalizedRecommendations(data.recommendedDoctors || [])
      setRecommendationStrategy(data.recommendationStrategy || '')
      
      console.log('Personalized recommendations loaded:', data)
    } catch (error) {
      console.error("Failed to fetch personalized recommendations:", error)
      // Fallback to regular recommended doctors if personalized fails
      setPersonalizedRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

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

  // Fetch personalized recommendations after doctors are loaded
  useEffect(() => {
    if (doctors.length > 0 && !speciality && !searchQuery) {
      fetchPersonalizedRecommendations()
    }
  }, [doctors, speciality, searchQuery])

  // Get recommended doctors (top rated and available) - fallback when personalized fails
  useEffect(() => {
    if (doctors.length > 0) {
      const recommended = doctors
        .filter(doctor => doctor.isAvailable && doctor.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3) // Show top 3 recommended doctors
      
      setRecommendedDoctors(recommended)
    }
  }, [doctors])

  // Apply specialty and search filter
  const applyFilter = () => {
    let filtered = doctors

    // Apply specialty filter
    if (speciality) {
      filtered = filtered.filter(doc => doc.specialtyDescription === speciality)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc => 
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialtyDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilterDoc(filtered)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality, searchQuery])

  // Handle specialty click
  const handleSpecialtyClick = (specialtyName) => {
    if (speciality === specialtyName) {
      navigate('/doctors')
    } else {
      navigate(`/doctors/${specialtyName}`)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Refresh recommendations
  const refreshRecommendations = () => {
    fetchPersonalizedRecommendations()
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentDoctors = filterDoc.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filterDoc.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Get page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }
    
    return pageNumbers
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

  // Render personalized recommendation card (same as normal card)
  const renderPersonalizedRecommendation = (doctor, index) => (
    <div 
      key={`personalized-${index}`}
      onClick={() => navigate(`/appointment/${doctor.doctorId}`)} 
      className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 relative'
    >
      <div className='relative'>
        <img 
          className='bg-blue-50 w-full h-48 object-cover' 
          src={`http://localhost:5000${doctor.imageUrl || '/api/placeholder/200/200'}`} 
          alt={doctor.doctorName}
          onError={(e) => {
            e.target.src = '/placeholder-doctor.jpg'
          }}
        />
        <div className='absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold'>
          For You
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
          <p className={`w-2 h-2 rounded-full ${doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></p>
          <p>{doctor.isAvailable ? 'Available' : 'Unavailable'}</p>
        </div>
        <p className='font-medium text-lg mt-2'>Dr. {doctor.doctorName}</p>
        <p className='text-gray-600'>{doctor.specialtyName}</p>
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-yellow-500'>★</span>
          <span className='text-sm text-gray-600'>{doctor.rating?.toFixed(1) || 'N/A'}</span>
          <span className='text-sm text-gray-500'>• {doctor.experienceYears} years exp.</span>
        </div>
      </div>
    </div>
  )

  // Render regular recommendation card (using the normal card style from second file)
  const renderRecommendation = (doctor, index) => (
    <div 
      key={`regular-${index}`}
      onClick={() => navigate(`/appointment/${doctor.doctorId}`)} 
      className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
    >
      <img 
        className='bg-blue-50 w-full h-48 object-cover' 
        src={`http://localhost:5000${doctor.imageUrl}`} 
        alt={doctor.fullName}
        onError={(e) => {
          e.target.src = '/placeholder-doctor.jpg'
        }}
      />
      <div className='p-4'>
        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
          <p className='w-2 h-2 rounded-full bg-green-500'></p>
          <p>Available</p>
        </div>
        <p className='font-medium text-lg mt-2'>Dr. {doctor.fullName}</p>
        <p className='text-gray-600'>{doctor.specialtyDescription}</p>
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-yellow-500'>★</span>
          <span className='text-sm text-gray-600'>{doctor.rating.toFixed(1)}</span>
          <span className='text-sm text-gray-500'>• {doctor.experienceYears} years exp.</span>
        </div>
      </div>
    </div>
  )

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className='flex justify-center items-center gap-2 mt-8'>
        {/* Previous button */}
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        {getPageNumbers().map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === number
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {number}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      
      <div className='flex flex-col sm:flex-row gap-5 mt-5'>
        {/* Left Sidebar - Specialty Filters */}
        <div className='w-full sm:w-64 flex-shrink-0'>
          <button 
            className={`py-1 px-3 border rounded text-sm transition-all sm:hidden w-full mb-4 ${showFilter ? 'bg-blue-300 text-white' : ''}`} 
            onClick={() => setShowFilter(prev => !prev)}
          >
            Filters
          </button>
          
          <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
            {/* Add "All Specialties" option */}
            <p 
              onClick={() => navigate('/doctors')} 
              className={`w-full pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${!speciality ? "bg-indigo-100 text-black" : ""}`}
            >
              All Specialties
            </p>
            
            {/* Dynamic specialty filters */}
            {specialties.map((specialty, index) => (
              <p 
                key={index}
                onClick={() => handleSpecialtyClick(specialty.description)} 
                className={`w-full pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === specialty.description ? "bg-indigo-100 text-black" : ""}`}
              >
                {specialty.description}
              </p>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className='flex-1'>
          {/* Search Bar */}
          <div className='mb-8'>
            <div className='relative max-w-md ml-auto'>
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
              />
              <svg 
                className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600'
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className='text-sm text-gray-500 mt-2 text-right'>
                Searching for: "{searchQuery}"
              </p>
            )}
          </div>

          {/* Personalized Recommendations Section */}
          {personalizedRecommendations.length > 0 && !speciality && !searchQuery && (
            <div className='mb-10'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-2xl font-semibold text-gray-800'>Personalized For You</h2>
                </div>
                <button
                  onClick={refreshRecommendations}
                  disabled={recommendationsLoading}
                  className='text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50'
                >
                  {recommendationsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {recommendationsLoading ? (
                <div className='flex justify-center items-center h-32'>
                  <div className='text-gray-500'>Loading personalized recommendations...</div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6'>
                  {personalizedRecommendations.map((doctor, index) => 
                    renderPersonalizedRecommendation(doctor, index)
                  )}
                </div>
              )}
            </div>
          )}

          {/* Regular Recommended Doctors Section - Show only if no personalized recommendations */}
          {recommendedDoctors.length > 0 && !speciality && !searchQuery && personalizedRecommendations.length === 0 && (
            <div className='mb-10'>
              <div className='flex items-center gap-2 mb-6'>
                <h2 className='text-2xl font-semibold text-gray-800'>Top Rated Doctors</h2>
                <span className='text-yellow-500 text-xl'>⭐</span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6'>
                {recommendedDoctors.map((doctor, index) => renderRecommendation(doctor, index))}
              </div>
            </div>
          )}
          
          {/* All Doctors Section with Title */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-2'>
                <h2 className='text-2xl font-semibold text-gray-800'>
                  {speciality ? `${speciality} Specialists` : 
                   searchQuery ? 'Search Results' : 'All Doctors'}
                </h2>
              </div>
              {filterDoc.length > 0 && (
                <div className='text-sm text-gray-500'>
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filterDoc.length)} of {filterDoc.length} doctors
                </div>
              )}
            </div>
            
            {/* All Doctors Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6'>
              {currentDoctors.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  {searchQuery ? `No doctors found for "${searchQuery}"` : 
                   speciality ? `No doctors found for ${speciality}` : 'No doctors available'}
                </div>
              ) : (
                currentDoctors.map((item, index) => (
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
                      <p className='font-medium text-lg mt-2'>Dr. {item.fullName}</p>
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
          
          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  )
}

export default Doctor