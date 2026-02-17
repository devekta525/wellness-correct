// Test script to verify the influencer dashboard API
// Run this with: node test-influencer-api.js

const testInfluencerDashboard = async () => {
    try {
        console.log('Testing Influencer Dashboard API...\n')

        // Test 1: Check if endpoint exists (should return 401 or authentication error)
        console.log('Test 1: Checking endpoint availability...')
        const response = await fetch('http://localhost:5000/v1/influencer-dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        console.log('Response status:', response.status)
        console.log('Response data:', JSON.stringify(data, null, 2))

        if (response.status === 401 || data.message === 'No Token') {
            console.log('✅ Endpoint is registered and requires authentication (expected)')
        } else if (response.status === 404) {
            console.log('❌ Endpoint not found - route may not be registered')
        } else if (response.status === 200) {
            console.log('✅ Endpoint working! Data structure:')
            console.log('- Has username:', !!data.data?.username)
            console.log('- Has name:', !!data.data?.name)
            console.log('- Has followers:', !!data.data?.followers)
            console.log('- Has referralCode:', !!data.data?.referralCode)
            console.log('- Has monthlyEarnings:', !!data.data?.monthlyEarnings)
            console.log('- Has performanceMetrics:', !!data.data?.performanceMetrics)
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message)
    }
}

testInfluencerDashboard()
