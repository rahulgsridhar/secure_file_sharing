

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

hashed = pwd_context.hash("test_password")
print("Hashed password:", hashed)

assert pwd_context.verify("test_password", hashed)
print("Password verified successfully!")
