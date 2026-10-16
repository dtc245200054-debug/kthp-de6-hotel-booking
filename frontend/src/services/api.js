// API Service tương tác với Backend Express
const API_BASE = '/api';

// Helper lấy Auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('hotel_admin_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // 1. XÁC THỰC QUẢN TRỊ (AUTH)
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Đăng nhập không thành công');
    if (result.data?.token) {
      localStorage.setItem('hotel_admin_token', result.data.token);
      localStorage.setItem('hotel_admin_user', JSON.stringify(result.data.user));
    }
    return result;
  },

  async getMe() {
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      this.logout();
      return null;
    }
    return res.json();
  },

  logout() {
    localStorage.removeItem('hotel_admin_token');
    localStorage.removeItem('hotel_admin_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('hotel_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 2. PHÒNG (ROOMS)
  async getRooms(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE}/rooms?${query.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách phòng');
    return res.json();
  },

  async getRoomById(id) {
    const res = await fetch(`${API_BASE}/rooms/${id}`);
    if (!res.ok) throw new Error('Không thể lấy chi tiết phòng');
    return res.json();
  },

  async getRoomTypes() {
    const res = await fetch(`${API_BASE}/rooms/types`);
    if (!res.ok) throw new Error('Không thể tải danh sách loại phòng');
    return res.json();
  },

  async createRoom(data) {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi khi tạo phòng mới');
    return result;
  },

  async updateRoom(id, data) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi cập nhật phòng');
    return result;
  },

  async deleteRoom(id) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Lỗi khi xóa phòng');
    return result;
  },

  // 3. ĐẶT PHÒNG (BOOKINGS)
  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Đặt phòng không thành công');
    return result;
  },

  // Tra cứu an toàn: Bắt buộc Mã đặt phòng VÀ Email
  async lookupBooking(code, email) {
    const query = new URLSearchParams({
      code: code.trim(),
      email: email.trim(),
    });
    const res = await fetch(`${API_BASE}/bookings/lookup?${query.toString()}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không tìm thấy thông tin đặt phòng');
    return result;
  },

  // Hủy đặt phòng
  async cancelBooking(code, email, reason = '') {
    const res = await fetch(`${API_BASE}/bookings/cancel/${code}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không thể hủy đơn');
    return result;
  },

  async getAllBookings(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách đơn đặt phòng');
    return res.json();
  },

  async updateBookingStatus(id, data) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Không thể cập nhật trạng thái');
    return result;
  },

  async getBookingHistory(id) {
    const res = await fetch(`${API_BASE}/bookings/${id}/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể lấy lịch sử trạng thái');
    return res.json();
  },

  // 4. QUẢN LÝ KHÁCH HÀNG (CUSTOMERS)
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/admin/customers?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
    return res.json();
  },

  // 5. THỐNG KÊ QUẢN TRỊ & SỨC KHỎE HỆ THỐNG
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải dữ liệu thống kê');
    return res.json();
  },

  async getHealth() {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Không thể kiểm tra health check');
    return res.json();
  },
};
