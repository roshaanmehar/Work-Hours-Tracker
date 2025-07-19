# 🕐 Work Hours Tracker

A retro-styled, pixel-art time tracking application built with Next.js, featuring a nostalgic 1980s arcade aesthetic combined with modern functionality for professional time management.

![PIN Entry Screen](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194502-v0SDhfW1lfKvIaqffz8GNgR5lP3DkA.png)

## ✨ Features

### 🔐 Secure Authentication
- **PIN-based Login**: Quick access with 4-digit PIN authentication
- **Admin Dashboard**: Separate admin authentication with advanced management features
- **Role-based Access**: Different permission levels for users and administrators

![Main Time Tracker](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194536-yims9hfNKaMJfWPqYZNmgNLDsKi2Uw.png)

### ⏱️ Time Tracking
- **Digital Clock Display**: Large, pixel-art style time display with individual digit animations
- **One-Click Controls**: Simple Clock In/Out and Break management
- **Real-time Updates**: Live timer with second-by-second accuracy
- **Status Indicators**: Clear visual feedback for current work state (READY/WORKING/ON BREAK)
- **Audio Feedback**: Retro sound effects for different actions

### 📊 Analytics & Reporting

![Analytics Dashboard](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194757-bA5zF1t8S8zy33mExPCxYfxD1Ov4VZ.png)

- **Productivity Metrics**: Weekly and monthly productivity scores
- **Time Statistics**: Total hours, daily averages, and work streaks
- **Visual Charts**: Circular progress indicators and trend analysis

![Work Pattern Visualization](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194823-GjMvppbANsjcVwcN4LtPzKFMVeji1i.png)

- **Work Pattern Heatmap**: Visual representation of daily work intensity
- **Weekly Overview**: At-a-glance view of work distribution across days

### 📈 Advanced Reporting

![Time Reports](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194654-DTvkOKrwjl0uM52zoWlv7DBHUbU6Lq.png)

- **Flexible Filtering**: Filter by date ranges, users, and work categories
- **Export Options**: Export data to various formats (CSV, PDF, Excel)
- **Print Support**: Professional report printing capabilities
- **Custom Date Ranges**: Detailed time period analysis

### 📋 Time History

![Time History](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194625-tdYEz9VqqzyJSYIxYIdxX2kjA5lArc.png)

- **Detailed Logs**: Complete history of all time entries
- **Session Breakdown**: Individual work sessions with start/end times
- **Duration Calculations**: Automatic calculation of work periods
- **Date Organization**: Chronological organization of work history

### 💰 Expense Tracking

![Expenses](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194725-WCLOBivX7gI4hX7NmXMGniCr0btXoT.png)

- **Expense Management**: Track work-related expenses
- **Category Organization**: Organize expenses by job/project categories
- **Search Functionality**: Quick expense lookup and filtering
- **Total Calculations**: Automatic expense summation and reporting

### 🛠️ Admin Dashboard

![Admin Authentication](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194850-joKtjjjCLOT2ANTZzWJlgF5mA5WaKv.png)

![Admin Records](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-19%20194925-DyV7VpyRkIzkMTGRMx3fDYzPWj9CZ0.png)

- **User Management**: Complete user administration interface
- **Database Records**: Direct access to time tracking records
- **Audit Logging**: Track all system changes and modifications
- **Settings Management**: System-wide configuration options
- **Data Filtering**: Advanced search and filter capabilities

## 🎨 Design Philosophy

### Retro Aesthetic
- **Pixel Art Style**: Authentic 8-bit gaming visual elements
- **CRT Monitor Effects**: Subtle screen flicker and scanline animations
- **Golden Accent Colors**: Distinctive yellow/gold color scheme (#e5b80b)
- **Press Start 2P Font**: Classic arcade gaming typography

### User Experience
- **Intuitive Navigation**: Simple, icon-based navigation system
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Fast loading times and smooth animations

## 🚀 Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: CSS Modules with custom pixel-art components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom PIN-based system with role management
- **State Management**: React Context API
- **Audio**: Web Audio API for retro sound effects
- **Animations**: CSS animations with hardware acceleration

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/roshaanmehar/Work-Hours-Tracker.git

# Navigate to project directory
cd Work-Hours-Tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Setup

The application uses Supabase as the backend database. Run the provided SQL schema to set up the required tables:

```sql
-- Users table for authentication
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time entries table
CREATE TABLE time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  job_category TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎮 Usage

1. **Initial Setup**: Enter your 4-digit PIN to access the application
2. **Time Tracking**: Use the "CLOCK IN" button to start tracking time
3. **Break Management**: Take breaks using the break controls
4. **View History**: Check your time history in the History section
5. **Analytics**: Monitor your productivity in the Analytics dashboard
6. **Admin Access**: Administrators can access advanced features through the Admin panel

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Optimized button sizes
- Mobile-specific layouts
- Gesture support

## 🔊 Audio Features

- **Clock In/Out Sounds**: Distinctive audio feedback for time tracking actions
- **Break Notifications**: Audio cues for break start/end
- **Customizable**: Sound effects can be enabled/disabled in settings

## 🎯 Key Features Highlight

- ✅ **Pixel-perfect retro design** with authentic 8-bit aesthetics
- ✅ **Real-time time tracking** with live updates
- ✅ **Comprehensive reporting** with multiple export formats
- ✅ **Admin dashboard** for user and data management
- ✅ **Expense tracking** integrated with time management
- ✅ **Mobile-responsive** design for on-the-go tracking
- ✅ **Secure authentication** with PIN and admin access
- ✅ **Audio feedback** for enhanced user experience

## 🔄 Version History

This repository contains multiple versions and iterations of the time tracking application. Each version represents different feature sets and design improvements developed over time.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic 1980s arcade machines and time clock systems
- Built with modern web technologies for reliability and performance
- Designed for both individual users and team management

---

**Note**: This application combines nostalgic design with practical functionality, making time tracking an engaging and visually appealing experience while maintaining professional-grade features for serious time management needs.
```

