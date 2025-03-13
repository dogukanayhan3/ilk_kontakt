package com.luv2code.springboot.cruddemo.entitiy;

import jakarta.persistence.*;

@Entity
@Table(name="users")
public class Users {

    //define fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private int userId;

    @Column(name="username")
    private String username;

    @Column(name="password_hash")
    private String passwordHash;

    @Column(name="name")
    private String name;

    @Column(name="email")
    private String email;

    @Column(name="role_id")
    private int roleId;

    @Column(name="organization_id")
    private Integer organizationId; // Use Integer to allow null values

    @Column(name="created_at")
    private java.time.LocalDateTime createdAt;

    //define constructors
    public Users() {
        //No arg constructor required by JPA
    }

    public Users(String username, String passwordHash, String name, String email, int roleId, Integer organizationId, java.time.LocalDateTime createdAt) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.organizationId = organizationId;
        this.createdAt = createdAt;
    }

    //define getter/setter
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getRoleId() {
        return roleId;
    }

    public void setRoleId(int roleId) {
        this.roleId = roleId;
    }

    public Integer getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Integer organizationId) {
        this.organizationId = organizationId;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    //define toString()
    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", passwordHash='" + passwordHash + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", roleId=" + roleId +
                ", organizationId=" + organizationId +
                ", createdAt=" + createdAt +
                '}';
    }
}