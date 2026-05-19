import { ChevronLeft, ChevronRight } from 'lucide-react';

const SidebarToggleBtn = ({fn, open}) => {
  return (
    <div
        className="blogSidebarToggle"
        onClick={fn}
    >
        {open ? <ChevronLeft /> : <ChevronRight />}
    </div>
  )
}

export default SidebarToggleBtn