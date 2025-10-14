// // components/core/ProtectedRoute.tsx (Enhanced)
// 'use client';

// import { usePrivy } from '@privy-io/react-auth';
// import { useEffect, ReactNode } from 'react';
// import { usePathname } from 'next/navigation';

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// export default function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { ready, authenticated } = usePrivy();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (ready && !authenticated) {
//       // Clear any stale localStorage data
//       localStorage.removeItem('payslab_business_name');
//       localStorage.removeItem('payslab_user_email');
      
//       // Redirect to sign-in page if not authenticated
//       const signInUrl = process.env.NEXT_PUBLIC_WEBSITE_URL + '/sign-in' || '/sign-in';
      
//       // Add current path as return URL (optional)
//       const returnUrl = encodeURIComponent(pathname);
//       window.location.href = `${signInUrl}?return=${returnUrl}`;
//     }
//   }, [ready, authenticated, pathname]);

//   // Show loading while Privy initializes
//   if (!ready) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading PaySlab...</p>
//           <p className="text-sm text-gray-500 mt-2">Initializing secure connection</p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading if not authenticated (will redirect)
//   if (!authenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
//           <p className="text-gray-600 mb-4">Please sign in to access PaySlab</p>
//           <div className="animate-pulse">
//             <div className="h-2 bg-gray-300 rounded w-48 mx-auto"></div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">Redirecting to sign-in...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render protected content
//   return <>{children}</>;
// }