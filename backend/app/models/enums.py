import enum

class UserRole(str, enum.Enum):
    USER = "user"
    PROPERTY_MANAGER = "property_manager"
    MAINTENANCE = "maintenance"
    ADMIN = "admin"
