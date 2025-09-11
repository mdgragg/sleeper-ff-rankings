import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <NavigationMenu.Root className="relative flex justify-center">
          <NavigationMenu.List className="flex gap-6">
            <NavigationMenu.Item>
              <Link
                to="/"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/standings"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Standings
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/week/1"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Weekly
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/history"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                History
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/draft"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Draft
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/awards"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Awards
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/hof"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Hall of Fame
              </Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link
                to="/stats"
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                Stats
              </Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </div>
  );
}
