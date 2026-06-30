import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classroomService } from "../services/classroom.service";
import type { UpdateClassPayload } from "../types";

// Hook to fetch teacher's classes
export const useMyClassesTeacher = () => {
  return useQuery({
    queryKey: ["my-classes-teacher"],
    queryFn: classroomService.getMyClassesTeacher,
  });
};

// Hook to create a new class (for teacher)
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classroomService.createClass,
    onSuccess: () => {
      // Invalidate and refetch the classes after creating a new one
      queryClient.invalidateQueries({ queryKey: ["my-classes-teacher"] });
    },
  });
};

// Hook to update a class (for teacher)
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { classId: string; payload: UpdateClassPayload }) =>
      classroomService.updateClass(payload.classId, payload.payload),
    onSuccess: () => {
      // Invalidate and refetch the classes after updating a class
      queryClient.invalidateQueries({ queryKey: ["my-classes-teacher"] });
    },
  });
};

// Hook to delete a class (for teacher)
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => classroomService.deleteClass(classId),
    onSuccess: () => {
      // Invalidate and refetch the classes after deleting a class
      queryClient.invalidateQueries({ queryKey: ["my-classes-teacher"] });
    },
  });
};

// Hook to fetch my joined classes
export const useMyJoinedClass = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["my-joined-classes"],
    queryFn: classroomService.getMyJoinedClass,
  });
};

// Hook to join class
export const useJoinClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classroomService.joinClass,
    onSuccess: () => {
      // Invalidate and refetch the classes after creating a new one
      queryClient.invalidateQueries({ queryKey: ["my-joined-classes"] });
    },
  });
};

// Hook to fetch teacher's classes
export const useGetClassMember = (classId: string) => {
  return useQuery({
    queryKey: ["class-member", classId],
    queryFn: () => classroomService.getClassMember(classId),
  });
};

// Hook to fetch classroom book
export const useGetClassBook = (classId: string) => {
  return useQuery({
    queryKey: ["class-book", classId],
    queryFn: () => classroomService.getClassBook(classId),
  });
};

// Hook to add book to classroom
export const useAddBookToClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { classId: string; bookId: string; order: number }) =>
      classroomService.addBookToClass(payload.classId, {
        book_id: payload.bookId,
        order: payload.order,
      }),
    onSuccess: (_, variables) => {
      // Invalidate and refetch the class books list
      queryClient.invalidateQueries({
        queryKey: ["class-book", variables.classId],
      });
    },
  });
};

// Hook to remove book from classroom
export const useRemoveBookFromClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { classId: string; bookId: string }) =>
      classroomService.removeBookFromClass(payload.classId, payload.bookId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch the class books list
      queryClient.invalidateQueries({
        queryKey: ["class-book", variables.classId],
      });
    },
  });
};
