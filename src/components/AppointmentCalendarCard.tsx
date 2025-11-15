'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded"></div>
})
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid'), { ssr: false })
const interactionPlugin = dynamic(() => import('@fullcalendar/interaction'), { ssr: false })

interface AppointmentCalendarCardProps {
    title?: string
    description?: string
    calendarData: any[]
    eventColor?: string
    modalTitle?: string
    showCustomerInfo?: boolean
    showStaffInfo?: boolean
    showSalonInfo?: boolean
}

const AppointmentCalendarCard = ({
    title = "Appointment Calendar",
    description = "Monthly view of appointments",
    calendarData,
    eventColor = "#ec4899",
    modalTitle = "Appointment Details",
    showCustomerInfo = true,
    showStaffInfo = true,
    showSalonInfo = false
}: AppointmentCalendarCardProps) => {
    const [isClient, setIsClient] = useState(false);
    const [plugins, setPlugins] = useState<any[]>([]);

    useEffect(() => {
        const loadPlugins = async () => {
            try {
                const [dayGrid, interaction] = await Promise.all([
                    import('@fullcalendar/daygrid'),
                    import('@fullcalendar/interaction')
                ]);
                setPlugins([dayGrid.default, interaction.default]);
                setIsClient(true);
            } catch (error) {
                console.error('Failed to load FullCalendar plugins:', error);
                setIsClient(true);
            }
        };
        
        loadPlugins();
    }, []);

    const handleEventClick = (info: any) => {
        const eventDetails = `
            <div class="p-4">
                <h3 class="text-lg font-bold text-gray-800 mb-3">${info.event.title}</h3>
                <div class="space-y-2">
                    ${showCustomerInfo && info.event.extendedProps.customer ? `<p><span class="font-semibold">Customer:</span> ${info.event.extendedProps.customer}</p>` : ''}
                    ${showStaffInfo && info.event.extendedProps.staff ? `<p><span class="font-semibold">Staff:</span> ${info.event.extendedProps.staff}</p>` : ''}
                    ${showSalonInfo && info.event.extendedProps.salon ? `<p><span class="font-semibold">Salon:</span> ${info.event.extendedProps.salon}</p>` : ''}
                    <p><span class="font-semibold">Status:</span> <span class="capitalize">${info.event.extendedProps.status}</span></p>
                    <p><span class="font-semibold">Price:</span> R${info.event.extendedProps.price}</p>
                    ${info.event.extendedProps.phone ? `<p><span class="font-semibold">Phone:</span> ${info.event.extendedProps.phone}</p>` : ''}
                    ${info.event.extendedProps.notes ? `<p><span class="font-semibold">Notes:</span> ${info.event.extendedProps.notes}</p>` : ''}
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="flex justify-between items-center p-4 border-b">
                    <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
                    <button class="text-gray-400 hover:text-gray-600 text-2xl font-bold" onclick="this.closest('.fixed').remove()">&times;</button>
                </div>
                ${eventDetails}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    const handleEventMouseEnter = (info: any) => {
        const tooltipParts = [info.event.title];
        if (showCustomerInfo && info.event.extendedProps.customer) {
            tooltipParts.push(`Customer: ${info.event.extendedProps.customer}`);
        }
        if (showStaffInfo && info.event.extendedProps.staff) {
            tooltipParts.push(`Staff: ${info.event.extendedProps.staff}`);
        }
        if (showSalonInfo && info.event.extendedProps.salon) {
            tooltipParts.push(`Salon: ${info.event.extendedProps.salon}`);
        }
        tooltipParts.push(`Status: ${info.event.extendedProps.status}`);
        
        info.el.title = tooltipParts.join('\n');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {isClient && plugins.length > 0 && calendarData && calendarData.length > 0 ? (
                    <div className="calendar-container">
                        <FullCalendar
                            key={`calendar-${calendarData.length}`}
                            plugins={plugins}
                            initialView="dayGridMonth"
                            events={calendarData}
                            eventClick={handleEventClick}
                            eventMouseEnter={handleEventMouseEnter}
                            height="auto"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            eventColor={eventColor}
                            eventTextColor="#ffffff"
                            eventBorderColor={eventColor}
                            dayMaxEvents={3}
                            moreLinkClick="popover"
                            eventDisplay="block"
                            eventClassNames="rounded-md shadow-sm"
                        />
                        <style jsx global>{`
                            .calendar-container {
                                padding: 1rem;
                                background: white;
                            }
                            
                            .fc {
                                font-family: inherit;
                            }
                            
                            .fc-header-toolbar {
                                margin-bottom: 1rem;
                                padding: 0.5rem;
                                background: linear-gradient(135deg, ${eventColor} 0%, #8b5cf6 100%);
                                border-radius: 0.5rem;
                                color: white;
                            }
                            
                            .fc-toolbar-title {
                                color: white !important;
                                font-size: 1.25rem;
                                font-weight: 600;
                            }
                            
                            .fc-button-primary {
                                background: rgba(255, 255, 255, 0.2) !important;
                                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                                color: white !important;
                                border-radius: 0.375rem;
                                font-weight: 500;
                            }
                            
                            .fc-button-primary:hover {
                                background: rgba(255, 255, 255, 0.3) !important;
                                border-color: rgba(255, 255, 255, 0.4) !important;
                            }
                            
                            .fc-button-primary:disabled {
                                background: rgba(255, 255, 255, 0.1) !important;
                                border-color: rgba(255, 255, 255, 0.2) !important;
                                opacity: 0.6;
                            }
                            
                            .fc-daygrid-day {
                                background: white;
                                border: 1px solid #e5e7eb;
                            }
                            
                            .fc-daygrid-day:hover {
                                background: #f9fafb;
                            }
                            
                            .fc-day-today {
                                background: #fef3f2 !important;
                            }
                            
                            .fc-daygrid-day-number {
                                color: #374151;
                                font-weight: 500;
                                padding: 0.25rem;
                            }
                            
                            .fc-event {
                                border-radius: 0.375rem !important;
                                border: none !important;
                                padding: 0.125rem 0.375rem;
                                font-size: 0.75rem;
                                font-weight: 500;
                                cursor: pointer;
                                transition: all 0.2s ease;
                            }
                            
                            .fc-event:hover {
                                transform: translateY(-1px);
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
                            }
                            
                            .fc-event-title {
                                font-weight: 600;
                            }
                            
                            .fc-more-link {
                                color: ${eventColor};
                                font-weight: 500;
                            }
                            
                            .fc-popover {
                                border: none;
                                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                                border-radius: 0.5rem;
                            }
                            
                            .fc-popover-header {
                                background: linear-gradient(135deg, ${eventColor} 0%, #8b5cf6 100%);
                                color: white;
                                border-radius: 0.5rem 0.5rem 0 0;
                                padding: 0.75rem;
                                font-weight: 600;
                            }
                        `}</style>
                    </div>
                ) : isClient && plugins.length > 0 ? (
                    <p className="text-gray-500 p-4">No calendar data available</p>
                ) : (
                    <div className="p-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AppointmentCalendarCard;
