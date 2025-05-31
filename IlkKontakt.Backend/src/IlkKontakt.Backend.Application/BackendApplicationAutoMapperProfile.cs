using AutoMapper;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Courses;
using IlkKontakt.Backend.Posts;
using IlkKontakt.Backend.UserProfiles;
using IlkKontakt.Backend.Connections;
using IlkKontakt.Backend.Contact;
using IlkKontakt.Backend.JobListings;
using IlkKontakt.Backend.Notifications;

namespace IlkKontakt.Backend;

public class BackendApplicationAutoMapperProfile : Profile
{
    public BackendApplicationAutoMapperProfile()
    {
        CreateMap<Book, BookDto>();
        CreateMap<CreateUpdateBookDto, Book>();
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
        
        CreateMap<Post, PostDto>()
            .ForMember(d => d.UserLikes,
                opt => opt.MapFrom(s => s.UserLikes))
            .ForMember(d => d.NumberOfLikes,
                opt => opt.MapFrom(s => s.NumberOfLikes))
            .ForMember(d => d.UserComments,
                opt => opt.MapFrom(s => s.UserComments));

        CreateMap<CreateUpdatePostDto, Post>()
            .ForMember(d => d.UserLikes,    // clears likes on a create/update
                opt => opt.Ignore())
            .ForMember(d => d.UserComments,
                opt => opt.Ignore());

        CreateMap<Comment, CommentDto>();
        
        CreateMap<UserProfile, UserProfileDto>();
        CreateMap<CreateUpdateUserProfileDto, UserProfile>();
        
        CreateMap<Experience, ExperienceDto>();
        CreateMap<CreateUpdateExperienceDto, Experience>();

        CreateMap<Education, EducationDto>();
        CreateMap<CreateUpdateEducationDto, Education>();

        CreateMap<Project, ProjectDto>();
        CreateMap<CreateUpdateProjectDto, Project>();
        
        CreateMap<Skill, SkillDto>();
        CreateMap<CreateUpdateSkillDto, Skill>();
        
        CreateMap<Language, LanguageDto>();
        CreateMap<CreateUpdateLanguageDto, Language>();
        
        CreateMap<Connection, ConnectionDto>();
        CreateMap<CreateConnectionDto, Connection>();
        CreateMap<UpdateConnectionStatusDto, Connection>();
        
        CreateMap<Course, CourseDto>();
        CreateMap<CreateUpdateCourseDto, Course>();
        
        CreateMap<Enrollment, EnrollmentDto>();
        CreateMap<CreateUpdateEnrollmentDto, Enrollment>();

        CreateMap<Instructor, InstructorDto>();
        CreateMap<CreateUpdateInstructorDto, Instructor>();

        CreateMap<JobListing, JobListingDto>();
        CreateMap<CreateUpdateJobListingDto, JobListing>();

        CreateMap<ContactUs, ContactUsDto>();
        CreateMap<CreateUpdateContactUsDto, ContactUs>();
        
        CreateMap<Notification, NotificationDto>();
        CreateMap<CreateNotificationDto, Notification>();

    }
}
