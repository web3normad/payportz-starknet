"use client";
import React, { useState } from 'react';
import { Plus, Funnel, Users, MagnifyingGlass } from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import UserCard from '../components/users/UserCard';

const UsersPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample users data
  const allUsers = [
    {
      id: '1',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      verified: true,
      trades: 15,
      rating: 4.8,
      joined: 'Jan 2024',
      status: 'active' as const
    },
    {
      id: '2',
      name: 'David Brown',
      email: 'david@example.com',
      verified: false,
      trades: 3,
      rating: 4.2,
      joined: 'Mar 2024',
      status: 'active' as const
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      verified: true,
      trades: 28,
      rating: 4.9,
      joined: 'Dec 2023',
      status: 'active' as const
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john@example.com',
      verified: true,
      trades: 42,
      rating: 4.7,
      joined: 'Oct 2023',
      status: 'inactive' as const
    },
    {
      id: '5',
      name: 'Lisa Johnson',
      email: 'lisa@example.com',
      verified: false,
      trades: 1,
      rating: 3.8,
      joined: 'Apr 2024',
      status: 'active' as const
    },
    {
      id: '6',
      name: 'Mike Chen',
      email: 'mike@example.com',
      verified: true,
      trades: 67,
      rating: 4.9,
      joined: 'Aug 2023',
      status: 'suspended' as const
    },
    {
      id: '7',
      name: 'Anna Rodriguez',
      email: 'anna@example.com',
      verified: true,
      trades: 23,
      rating: 4.6,
      joined: 'Feb 2024',
      status: 'active' as const
    },
    {
      id: '8',
      name: 'James Taylor',
      email: 'james@example.com',
      verified: false,
      trades: 0,
      rating: 0,
      joined: 'May 2024',
      status: 'active' as const
    }
  ];

  const filterUsers = (users: typeof allUsers, filter: string, search: string) => {
    let filtered = users;

    // Apply status filter
    switch (filter) {
      case 'verified':
        filtered = filtered.filter(user => user.verified);
        break;
      case 'unverified':
        filtered = filtered.filter(user => !user.verified);
        break;
      case 'active':
        filtered = filtered.filter(user => user.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(user => user.status === 'inactive');
        break;
      case 'suspended':
        filtered = filtered.filter(user => user.status === 'suspended');
        break;
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredUsers = filterUsers(allUsers, activeFilter, searchQuery);

  const filters = [
    { id: 'all', label: 'All Users', count: allUsers.length },
    { id: 'verified', label: 'Verified', count: allUsers.filter(u => u.verified).length },
    { id: 'unverified', label: 'Unverified', count: allUsers.filter(u => !u.verified).length },
    { id: 'active', label: 'Active', count: allUsers.filter(u => u.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: allUsers.filter(u => u.status === 'inactive').length },
    { id: 'suspended', label: 'Suspended', count: allUsers.filter(u => u.status === 'suspended').length }
  ];

  const handleUserClick = (user: any) => {
    console.log('View user details:', user);
    // Navigate to user detail page or open modal
  };

  const handleAddUser = () => {
    console.log('Add new user');
    // Open add user form/modal
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        {/* Search and Filter Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b61c2] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="small">
              <Funnel size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-[#8b61c2] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {allUsers.length} users
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-sm text-[#8b61c2] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
        
        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={handleUserClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No users match "${searchQuery}" with the current filters.`
                : 'No users match the current filter criteria.'
              }
            </p>
            <div className="flex justify-center space-x-3">
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button variant="outline" onClick={() => setActiveFilter('all')}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsersPage;