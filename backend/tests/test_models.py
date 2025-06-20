"""Tests for model functionality."""

import pytest
from datetime import datetime
from sqlalchemy.orm import Session

from app import models, schemas
from app.crud.crud_user import user
from app.core.security import get_password_hash


class TestUserModel:
    """Test User model functionality."""
    
    def test_user_creation(self, test_db: Session):
        """Test creating a user model."""
        user_obj = models.User(
            email="model@example.com",
            hashed_password=get_password_hash("ModelPassword123"),
            first_name="Model",
            last_name="User",
            is_active=True,
            role="user"
        )
        
        test_db.add(user_obj)
        test_db.commit()
        test_db.refresh(user_obj)
        
        assert user_obj.id is not None
        assert user_obj.email == "model@example.com"
        assert user_obj.full_name == "Model User"
        assert user_obj.is_active is True
        assert user_obj.is_admin is False
    
    def test_user_full_name_property(self, test_db: Session):
        """Test the full_name property."""
        # User with both names
        user_obj = models.User(
            email="fullname@example.com",
            hashed_password=get_password_hash("Password123"),
            first_name="John",
            last_name="Doe"
        )
        assert user_obj.full_name == "John Doe"
        
        # User with only first name
        user_obj.last_name = None
        assert user_obj.full_name == "fullname@example.com"
        
        # User with no names
        user_obj.first_name = None
        assert user_obj.full_name == "fullname@example.com"
    
    def test_user_is_admin_property(self, test_db: Session):
        """Test the is_admin property."""
        # Regular user
        user_obj = models.User(
            email="regular@example.com",
            hashed_password=get_password_hash("Password123"),
            role="user",
            is_superuser=False
        )
        assert user_obj.is_admin is False
        
        # Admin user
        user_obj.role = "admin"
        assert user_obj.is_admin is True
        
        # Superuser
        user_obj.role = "user"
        user_obj.is_superuser = True
        assert user_obj.is_admin is True
    
    def test_user_set_password(self, test_db: Session):
        """Test setting user password."""
        user_obj = models.User(
            email="setpass@example.com",
            hashed_password="temporary"
        )
        
        user_obj.set_password("NewPassword123")
        
        assert user_obj.hashed_password != "temporary"
        assert user_obj.check_password("NewPassword123") is True
        assert user_obj.check_password("WrongPassword") is False
    
    def test_user_check_password(self, test_db: Session):
        """Test checking user password."""
        password = "CheckPassword123"
        user_obj = models.User(
            email="checkpass@example.com",
            hashed_password=get_password_hash(password)
        )
        
        assert user_obj.check_password(password) is True
        assert user_obj.check_password("WrongPassword") is False
    
    def test_user_repr(self, test_db: Session):
        """Test user string representation."""
        user_obj = models.User(
            id=1,
            email="repr@example.com",
            hashed_password=get_password_hash("Password123")
        )
        
        expected_repr = "<User repr@example.com (ID: 1)>"
        assert repr(user_obj) == expected_repr


class TestBankConnectionModel:
    """Test BankConnection model functionality."""
    
    def test_bank_connection_creation(self, test_db: Session):
        """Test creating a bank connection model."""
        # First create a user
        user_data = schemas.UserCreate(
            email="bankuser@example.com",
            password="BankPassword123",
            first_name="Bank",
            last_name="User"
        )
        user_obj = user.create(db=test_db, obj_in=user_data)
        
        # Create bank connection
        bank_conn = models.BankConnection(
            id="bc_123",
            user_id=str(user_obj.id),
            institution_id="santander_uk",
            institution_name="Santander UK",
            status=models.BankConnectionStatus.CONNECTED
        )
        
        test_db.add(bank_conn)
        test_db.commit()
        test_db.refresh(bank_conn)
        
        assert bank_conn.id == "bc_123"
        assert bank_conn.institution_name == "Santander UK"
        assert bank_conn.status == models.BankConnectionStatus.CONNECTED
    
    def test_bank_connection_to_dict(self, test_db: Session):
        """Test bank connection to_dict method."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="dictuser@example.com",
            password="DictPassword123",
            first_name="Dict",
            last_name="User"
        )
        user_obj = user.create(db=test_db, obj_in=user_data)
        
        bank_conn = models.BankConnection(
            id="bc_dict",
            user_id=str(user_obj.id),
            institution_id="test_bank",
            institution_name="Test Bank",
            status=models.BankConnectionStatus.CONNECTED
        )
        
        test_db.add(bank_conn)
        test_db.commit()
        test_db.refresh(bank_conn)
        
        result_dict = bank_conn.to_dict()
        
        assert result_dict["id"] == "bc_dict"
        assert result_dict["institution_name"] == "Test Bank"
        assert result_dict["status"] == models.BankConnectionStatus.CONNECTED
        assert "created_at" in result_dict
        assert "updated_at" in result_dict


class TestTransactionModel:
    """Test Transaction model functionality."""
    
    def test_transaction_creation(self, test_db: Session):
        """Test creating a transaction model."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="transuser@example.com",
            password="TransPassword123",
            first_name="Trans",
            last_name="User"
        )
        user_obj = user.create(db=test_db, obj_in=user_data)
        
        transaction = models.Transaction(
            id="tx_123",
            user_id=str(user_obj.id),
            amount=100.50,
            currency="GBP",
            description="Test transaction",
            type=models.TransactionType.INCOME,
            status=models.TransactionStatus.COMPLETED,
            booking_date=datetime.utcnow(),
            value_date=datetime.utcnow()
        )
        
        test_db.add(transaction)
        test_db.commit()
        test_db.refresh(transaction)
        
        assert transaction.id == "tx_123"
        assert float(transaction.amount) == 100.50
        assert transaction.type == models.TransactionType.INCOME
        assert transaction.status == models.TransactionStatus.COMPLETED
    
    def test_transaction_to_dict(self, test_db: Session):
        """Test transaction to_dict method."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="transdictuser@example.com",
            password="TransDictPassword123",
            first_name="TransDict",
            last_name="User"
        )
        user_obj = user.create(db=test_db, obj_in=user_data)
        
        transaction = models.Transaction(
            id="tx_dict",
            user_id=str(user_obj.id),
            amount=75.25,
            currency="EUR",
            description="Dict test transaction",
            type=models.TransactionType.EXPENSE,
            status=models.TransactionStatus.COMPLETED,
            booking_date=datetime.utcnow(),
            value_date=datetime.utcnow()
        )
        
        test_db.add(transaction)
        test_db.commit()
        test_db.refresh(transaction)
        
        result_dict = transaction.to_dict()
        
        assert result_dict["id"] == "tx_dict"
        assert result_dict["amount"] == 75.25
        assert result_dict["currency"] == "EUR"
        assert result_dict["type"] == models.TransactionType.EXPENSE.value
        assert result_dict["status"] == models.TransactionStatus.COMPLETED.value
        assert "booking_date" in result_dict
        assert "created_at" in result_dict