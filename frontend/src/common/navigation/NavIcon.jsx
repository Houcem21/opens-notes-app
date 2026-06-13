import { Home, BookOpen, Network, CheckSquare, Pencil, BookOpenText, ChartNetwork, ListTodo } from "lucide-react";

const NavIcon = ({iconTitle, isActive}) => {
    

    switch(iconTitle) {
        case "Home": return <Home className={isActive ? "icon active" : "icon"} />;
        case "Blog": return <BookOpen className={isActive ? "icon active" : "icon"} />;
        case "Notes": return <Network className={isActive ? "icon active" : "icon"} />;
        case "Tasks": return <CheckSquare className={isActive ? "icon active" : "icon"} />;
        case "Admin": return <Pencil className={isActive ? "icon active" : "icon"} />;
        case "Admin Blog": return <BookOpenText className={isActive ? "icon active" : "icon"} />;
        case "Admin Notes": return <ChartNetwork className={isActive ? "icon active" : "icon"} />;
        case "Admin Tasks": return <ListTodo className={isActive ? "icon active" : "icon"} />;
        default: return null;
    }
}

export default NavIcon